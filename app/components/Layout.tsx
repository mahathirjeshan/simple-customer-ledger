import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100vh]">
      {/* <Menu /> */}
      <div className="border-t bg-background h-full">
        <div className="grid grid-cols-6 h-full">
          <Sidebar
            menuList={[
              {
                title: "Home",
                url: "/",
              },
              {
                title: "Customers",
                url: "/customers",
              },
              {
                title: "Transactions",
                url: "/transactions",
              },
              // {
              //   title: "Settings",
              //   url: "/settings",
              // },
            ]}
            className="h-full col-span-2 lg:col-span-1"
          />
          <div className="col-span-4 lg:col-span-5 border-l">
            <div className="h-full px-4 py-6 lg:px-8">
              <div className="h-full">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
