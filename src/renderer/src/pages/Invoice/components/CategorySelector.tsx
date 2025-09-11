import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../../../components/ui/button";

import { ChevronDown } from "lucide-react";
// تعريف أنواع البيانات للمكون
interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedId,
  onSelect,
  isLoading = false,
}) => {
  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedId)?.name || "اختر فئة المنتج";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-right"
          disabled={isLoading}
        >
          <span>{selectedCategoryName}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuLabel>قائمة الفئات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onSelect={() => onSelect(category.id)}
              className="cursor-pointer"
            >
              {category.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>لا توجد فئات متاحة</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategorySelector;
