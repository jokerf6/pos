import { MdPeople } from "react-icons/md";
import { cn } from "../../lib/utils";

export function MainNav({
  className,
  itemClass,
}: {
  itemClass?: string;
  className?: string;
}) {
  const navItems = [{ title: "Users", icon: MdPeople, href: `/users` }];
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {navItems?.map((item, index) => {
        if (!item) return null;
        return (
          <div key={item.title} className={cn("flex items-center", itemClass)}>
            <a
              href={item.href}
              className="text-sm gap-2 transition-colors hover:text-foreground text-muted-foreground flex items-center space-x-2"
            >
              {/* {item.icon && <span className="text-lg">{item.icon}</span>} */}
              <span>{item.title}</span>
            </a>
            {index < navItems.length - 1 && (
              <span
                className={`md:block hidden text-muted-foreground/40 mx-4`}
              ></span>
            )}
          </div>
        );
      })}
    </div>
  );
}
