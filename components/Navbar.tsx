"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Container from "./Container";
import Logo from "@/public/sameer.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import SearchInput from "./SearchInput";
import { ThemeToggler } from "./theme-toggler";
import { NavMenu } from "./NavMenu";

const Navbar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <div className="sticky top-0 border border-b-primary/10 bg-secondary">
      <Container>
        <div className="flex items-center justify-between">
          <div
            onClick={() => router.push("/")}
            className="flex items-center justify-between"
          >
            <Image
              src={Logo}
              alt="Sameer-logo"
              width={120}
              height={80}
              className="rounded-full cursor-pointer bg-red-300"
            />
          </div>
          <div>
            <SearchInput />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggler />
            {userId && <NavMenu />}
            <UserButton afterSignOutUrl="/" />
            {!userId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign In
                </Button>
                <Button onClick={() => router.push("/sign-up")} size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
