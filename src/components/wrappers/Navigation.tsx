// src/components/navigation.tsx
"use client";

import { Menu as MenuIcon } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Menu", href: "/menu" },
    { label: "Rooms", href: "/rooms" },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function Navigation() {
    return (
        <nav className="w-full flex items-center justify-between px-4 py-1 border-b">
            {/* Logo */}
            <div className="text-xl font-bold">Restaurant</div>

            {/* Desktop Nav */}
            <div className="hidden md:flex">
                <NavigationMenu>
                    <NavigationMenuList>
                        {navItems.map((item) => (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink asChild>
                                    <a
                                        href={item.href}
                                        className="px-4 py-2 hover:text-primary"
                                    >
                                        {item.label}
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MenuIcon className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-4">
                        <div className="flex flex-col gap-4 mt-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-lg font-medium hover:text-primary"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
