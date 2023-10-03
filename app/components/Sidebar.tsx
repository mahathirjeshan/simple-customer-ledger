import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useNavigate } from "@remix-run/react";
// import { ScrollArea } from "~/components/ui/scroll-area";

interface MenuList {
  title: string;
  url: string;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  menuList: MenuList[];
}

export function Sidebar({ className, menuList }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuList.map((menu, index) => (
              <Button
                variant="ghost"
                className="w-full justify-start"
                key={index}
                onClick={() => navigate(menu.url)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                {menu.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
