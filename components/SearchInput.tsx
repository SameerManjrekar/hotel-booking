"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { ChangeEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useDebounceValue } from "@/hooks/useDebounceValue";

const SearchInput = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [value, setValue] = useState(title || "");
  const router = useRouter();
  const pathname = usePathname();

  const debounceValue = useDebounceValue<string>(value);

  useEffect(() => {
    const query = {
      title: debounceValue,
    };

    const url = qs.stringifyUrl(
      {
        url: window.location.href.toLowerCase(),
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  }, [debounceValue, router]);

  if (pathname !== "/") return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setValue(e.target.value);
  };

  return (
    <div className="relative hidden sm:block">
      <Search className="absolute w-4 h-4 top-3 left-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder="Search..."
        className="pl-10 bg-primary/10"
      />
    </div>
  );
};

export default SearchInput;
