"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";

import { Hotel, Room } from "@prisma/client";
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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import { Button } from "../ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { Loader2, PencilLine, Plus, XCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AddRoomFormProps {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room?: Room;
  handleDialogOpen: () => void;
}
const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "The title should be minimum 3 characters long" }),
  description: z.string().min(10, {
    message: "The Description should be minimum 10 characters long",
  }),
  bedCount: z.coerce.number().min(1, { message: "Bed Count is required" }),
  guestCount: z.coerce.number().min(1, { message: "Guest Count is required" }),
  bathroomCount: z.coerce
    .number()
    .min(1, { message: "Bathroom Count is required" }),
  kingBed: z.coerce.number().min(0),
  queenBed: z.coerce.number().min(0),
  image: z.string().min(1, { message: "Image is required" }),
  breakfastPrice: z.coerce.number().optional(),
  roomPrice: z.coerce.number().min(1, { message: "Room Price is required" }),
  roomService: z.boolean().optional(),
  TV: z.boolean().optional(),
  balcony: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  cityView: z.boolean().optional(),
  oceanView: z.boolean().optional(),
  forestView: z.boolean().optional(),
  mountainView: z.boolean().optional(),
  airContioner: z.boolean().optional(),
  soundProof: z.boolean().optional(),
});

const AddRoomForm = ({ hotel, room, handleDialogOpen }: AddRoomFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [image, setImage] = useState<string | undefined>(room?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: room || {
      title: "",
      description: "",
      bedCount: 0,
      guestCount: 0,
      bathroomCount: 0,
      kingBed: 0,
      queenBed: 0,
      image: "",
      breakfastPrice: 0,
      roomPrice: 0,
      roomService: false,
      TV: false,
      balcony: false,
      freeWifi: false,
      cityView: false,
      oceanView: false,
      forestView: false,
      mountainView: false,
      airContioner: false,
      soundProof: false,
    },
  });

  useEffect(() => {
    if (typeof image === "string") {
      form.setValue("image", image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [image]);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    let response;
    try {
      if (hotel && room) {
        response = await axios.patch(`/api/room/${room.id}`, values);
        if (response.status === 200) {
          toast({
            variant: "success",
            description: "Room updated successfully!",
          });
          router.refresh();
        }
        setIsLoading(false);
        handleDialogOpen();
      } else {
        if (!hotel?.id) return;
        response = await axios.post("/api/room", {
          ...values,
          hotelId: hotel.id,
        });

        if (response.status === 201) {
          toast({
            variant: "success",
            description: "Room added successfully!",
          });
        }
        router.refresh();
        setIsLoading(false);
        handleDialogOpen();
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        description: "Something went wrong! Please try again! ",
      });
    }
  };

  return (
    <div className="max-h-[75vh] overflow-y-auto px-2">
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Title</FormLabel>
                <FormDescription>Provide a room name</FormDescription>
                <FormControl>
                  <Input placeholder="Double Room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Description</FormLabel>
                <FormDescription>
                  Is there anything special about this room
                </FormDescription>
                <FormControl>
                  <Textarea placeholder="description of room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Choose Room Amenities</FormLabel>
            <FormDescription>
              What makes this room a good choice?
            </FormDescription>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <FormField
                name="roomService"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>24 hours Room Service</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="TV"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>TV</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="balcony"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Balcony</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="freeWifi"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Free Wifi</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="cityView"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>City View</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="forestView"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Forest View</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="oceanView"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Ocean View</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="mountainView"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Mountain View</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="airContioner"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Air Conditioner</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                name="soundProof"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row space-x-3 rounded-md border p-4 items-end">
                    <FormControl>
                      <Checkbox
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                    <FormLabel>Sound Proof</FormLabel>
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
                  Choose an image that will show-case your room
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
                      <div className="flex flex-col items-center max-w-[800px] p-12 border-2 border-dashed border-primary/50 rounded mt-4">
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
          <div className="flex flex-row gap-6">
            <div className="flex flex-col flex-1 gap-6">
              <FormField
                control={form.control}
                name="roomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Price in USD</FormLabel>
                    <FormDescription>
                      State the price of staying in this room
                    </FormDescription>
                    <FormControl>
                      <Input type="number" {...field} min={0} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Count</FormLabel>
                    <FormDescription>
                      How many beds are available in this room?
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={8} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Count</FormLabel>
                    <FormDescription>
                      How many guests ara allowed in this room?
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={8} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="bathroomCount"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathroom Count</FormLabel>
                    <FormDescription>
                      How many bathrooms are in this room?
                    </FormDescription>
                    <FormControl>
                      <Input min={0} max={10} type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col flex-1 gap-6">
              <FormField
                control={form.control}
                name="breakfastPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breakfast Price</FormLabel>
                    <FormDescription>The price of Breakfast</FormDescription>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kingBed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>King Bed</FormLabel>
                    <FormDescription>
                      How many King Beds are available in this room?
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="queenBed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queen Bed</FormLabel>
                    <FormDescription>
                      How many Queen Beds are available in this room?
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="pt-4 pb-2">
            {room ? (
              <Button
                type="button"
                className="max-w-[150px]"
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
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
              <Button
                type="button"
                className="max-w-[150px]"
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2" />
                    Creating
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddRoomForm;
