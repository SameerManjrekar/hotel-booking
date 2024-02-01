"use client";

import { Hotel, Room } from "@prisma/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import Image from "next/image";
import {
  Eye,
  Loader2,
  PencilLine,
  Plus,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";
import axios from "axios";

import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "../ui/button";
import useLocation from "@/hooks/useLocation";
import { ICity, IState } from "country-state-city";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import AddRoomForm from "../room/AddRoomForm";
import { Separator } from "../ui/separator";
import RoomCard from "../room/RoomCard";

interface AddHotelFormProps {
  hotel: HotelWithRooms | null;
}

export type HotelWithRooms = Hotel & {
  rooms: Room[];
};

const formSchema = z.object({
  title: z.string().min(3, { message: "Title is required" }),
  description: z.string().min(10, { message: "Description is required" }),
  image: z.string().min(1, { message: "Image is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().optional(),
  city: z.string().optional(),
  locationDescription: z
    .string()
    .min(10, { message: "Location Description is required" }),
  gym: z.boolean().optional(),
  spa: z.boolean().optional(),
  bar: z.boolean().optional(),
  laundry: z.boolean().optional(),
  restaurant: z.boolean().optional(),
  shopping: z.boolean().optional(),
  freeParking: z.boolean().optional(),
  bikeRental: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  movieNights: z.boolean().optional(),
  swimmingPool: z.boolean().optional(),
  coffeeShop: z.boolean().optional(),
});

const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
  const [image, setImage] = useState<string | undefined>(hotel?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState<boolean>(false);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHotelDeleting, setIsHotelDeleting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { getAllCountries, getCountryStates, getStateCities } = useLocation();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: hotel || {
      title: "",
      description: "",
      image: "",
      country: "",
      state: "",
      city: "",
      locationDescription: "",
      gym: false,
      spa: false,
      bar: false,
      laundry: false,
      restaurant: false,
      shopping: false,
      freeParking: false,
      bikeRental: false,
      freeWifi: false,
      movieNights: false,
      coffeeShop: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    let response;
    try {
      if (hotel) {
        response = await axios.patch(`/api/hotel/${hotel.id}`, values);

        if (response.status === 200) {
          toast({
            variant: "success",
            description: "Hotel Updated Successfully!",
          });
          router.push(`/hotel/${response?.data?.id}`);
        }
        setIsLoading(false);
      } else {
        response = await axios.post("/api/hotel", values);

        if (response.status === 201) {
          toast({
            variant: "success",
            description: "Hotel Created Successfully!",
          });
        }
      }
      router.push(`/hotel/${response?.data?.id}`);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong! Please try again! ",
      });
    }
  };

  useEffect(() => {
    if (typeof image === "string") {
      form.setValue("image", image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [image]);

  useEffect(() => {
    const selectedCountry = form.watch("country");
    const countryStates = getCountryStates(selectedCountry);
    if (countryStates) {
      setStates(countryStates);
    }
  }, [form.watch("country")]);

  useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedState = form.watch("state");
    const stateCities = getStateCities(
      selectedCountry as string,
      selectedState as string
    );
    if (stateCities) {
      setCities(stateCities);
    }
  }, [form.watch("country"), form.watch("state")]);

  const handleImageDelete = async (image: string) => {
    setImageIsDeleting(true);
    const imageKey = image.substring(image.lastIndexOf("/") + 1);

    try {
      const response = await axios.post("/api/uploadthing/delete", {
        imageKey,
      });
      if (response.data.success) {
        setImage("");
        toast({
          variant: "success",
          description: "Image deleted successfully!",
        });
      }
    } catch (error: any) {
      setImage("");
      toast({
        variant: "destructive",
        description: `Error in Deleting image ${error?.message}`,
      });
    } finally {
      setImageIsDeleting(false);
    }
  };

  const handleHotelDelete = async (hotel: HotelWithRooms) => {
    try {
      setIsHotelDeleting(true);
      setImageIsDeleting(true);
      const getImageKey = async (src: string) =>
        src.substring(src.lastIndexOf("/") + 1);
      const imageKey = await getImageKey(hotel.image);
      const res = await axios.post("/api/uploadthing/delete", {
        imageKey,
      });

      const response = await axios.delete(`/api/hotel/${hotel.id}`);

      if (response.status === 200 && res.status === 200) {
        toast({
          variant: "success",
          description: "Hotel Deleted Successfully!",
        });
        router.push("/hotel/new");
      }
      setIsHotelDeleting(false);
    } catch (error: any) {
      setIsHotelDeleting(false);
      console.error("Error in Hotel Delete");
      toast({
        variant: "destructive",
        description: `Error in Hotel Delete! ${error.message}`,
      });
    }
  };

  const handleDialogOpen = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-lg font-semibold">
          {hotel ? "Update Hotel" : "Create your Hotel"}
        </h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-1 flex-col gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Title</FormLabel>
                  <FormDescription>Provide your hotel name</FormDescription>
                  <FormControl>
                    <Input placeholder="Beach Hotel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Description</FormLabel>
                  <FormDescription>
                    Provide your Hotel Description
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder="Hotel Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Choose Amenities</FormLabel>
              <FormDescription>
                Choose Amenities popular in your Hotel
              </FormDescription>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="gym"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Gym</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  name="spa"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Spa</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bar"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Bar</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="laundry"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Laundry</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restaurant"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Restaurant</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shopping"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Shopping</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeParking"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Free Parking</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bikeRental"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Bike Rental</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeWifi"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Free WiFi</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movieNights"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Movie Nights</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="swimmingPool"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Swimming Pool</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coffeeShop"
                  render={({ field }) => (
                    <FormItem className="flex items-end space-x-3 border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Coffee Shop</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3">
                  <FormLabel>Upload an Image *</FormLabel>
                  <FormDescription>
                    Choose an image that will show-case your hotel
                  </FormDescription>
                  <FormControl>
                    {image ? (
                      <div className="relative max-w-[400px] min-w-[200px] max-h-[400px] min-h-[200px] mt-4">
                        <Image
                          fill
                          src={image}
                          alt={`${hotel?.image}`}
                          className="object-contain"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-0 right-[-12px]"
                          onClick={() => handleImageDelete(image)}
                        >
                          {imageIsDeleting ? <Loader2 /> : <XCircle />}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center max-w-[400px] p-12 border-2 border-dashed border-primary/50 rounded mt-4">
                          <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                              setImage(res[0].url);
                              toast({
                                variant: "success",
                                description: "File Upload Completed!",
                              });
                            }}
                            onUploadError={(error: Error) => {
                              toast({
                                variant: "destructive",
                                description: `Error: ${error.message}`,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-1 flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select a Country</FormLabel>
                    <FormDescription>
                      In which country is your property located?
                    </FormDescription>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a Country"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllCountries?.map((country) => (
                          <SelectItem
                            key={country.isoCode}
                            value={country.isoCode}
                          >
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select a State</FormLabel>
                    <FormDescription>
                      In which state is your property located?
                    </FormDescription>
                    <Select
                      disabled={isLoading || states.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          placeholder="Select a State"
                          defaultValue={field.value}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {states?.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select a City</FormLabel>
                  <FormDescription>
                    In which city is your property located?
                  </FormDescription>
                  <Select
                    disabled={isLoading || cities.length === 0}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue
                        placeholder="Select a City"
                        defaultValue={field.value}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Description</FormLabel>
                  <FormDescription>
                    Provide a detailed location description of your hotel
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Located at the very end of the beach road!"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hotel && !hotel?.rooms.length && (
              <Alert className="bg-indigo-500 text-white">
                <Terminal className="h-4 w-4 stroke-white" />
                <AlertTitle>One Last Step!</AlertTitle>
                <AlertDescription>
                  Your Hotel was created successfully!
                  <div>Please add some rooms to complete your hotel setup.</div>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between flex-wrap gap-2">
              {/* Delete Hotel */}
              {hotel && (
                <Button
                  disabled={isHotelDeleting || isLoading}
                  variant="destructive"
                  type="button"
                  onClick={() => handleHotelDelete(hotel)}
                  className="max-w-[150px]"
                >
                  {isHotelDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Deleting
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}

              {/* View Hotel */}
              {hotel && (
                <Button
                  className="max-w-[150px]"
                  variant="default"
                  type="button"
                  onClick={() => router.push(`/hotel-details/${hotel.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Hotel
                </Button>
              )}

              {/* Modal */}
              {hotel && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger>
                    <Button
                      variant="outline"
                      type="button"
                      className="max-w-[150px]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[900px] w-[90%]">
                    <DialogHeader className="px-2">
                      <DialogTitle>Add a Room</DialogTitle>
                      <DialogDescription>
                        Add Description about a room in your hotel
                      </DialogDescription>
                    </DialogHeader>
                    <AddRoomForm
                      hotel={hotel}
                      handleDialogOpen={handleDialogOpen}
                    />
                  </DialogContent>
                </Dialog>
              )}

              {/* Add Hotel */}
              {hotel ? (
                <Button className="max-w-[150px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2" /> Updating
                    </>
                  ) : (
                    <>
                      <PencilLine className="w-4 h-4 mr-2" /> Update
                    </>
                  )}
                </Button>
              ) : (
                <Button className="max-w-[150px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Creating
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Hotel
                    </>
                  )}
                </Button>
              )}
            </div>
            {hotel && !!hotel.rooms.length && (
              <div>
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold my-4">Hotel Rooms</h3>
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {hotel.rooms.map((room) => (
                    <RoomCard key={room.id} hotel={hotel} room={room} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AddHotelForm;
