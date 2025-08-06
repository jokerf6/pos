import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPermissionsByCategory } from '../../store/slices/permissionsSlice';
import { RootState } from '../../store';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronRight, Shield, Users, BarChart3, Settings, CreditCard, Package } from 'lucide-react';

interface PermissionsSelectorProps {
  selectedPermissions: number[];
  onPermissionsChange: (permissions: number[]) => void;
  disabled?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  sales: <CreditCard className="w-4 h-4" />,
  inventory: <Package className="w-4 h-4" />,
  reports: <BarChart3 className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
  cashier: <Shield className="w-4 h-4" />,
};

const categoryNames: Record<string, string> = {
  sales: 'المبيعات',
  inventory: 'المخزون',
  reports: 'التقارير',
  users: 'إدارة المستخدمين',
  system: 'النظام',
  cashier: 'الكاشير',
};

const PermissionsSelector: React.FC<PermissionsSelectorProps> = ({
  selectedPermissions,
  onPermissionsChange,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const { permissionsByCategory, loading } = useSelector((state: RootState) => state.permissions);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(getPermissionsByCategory() as any);
  }, [dispatch]);

  const handlePermissionToggle = (permissionId: number) => {
    if (disabled) return;
    
    const isSelected = selectedPermissions.includes(permissionId);
    if (isSelected) {
      onPermissionsChange(selectedPermissions.filter(id => id !== permissionId));
    } else {
      onPermissionsChange([...selectedPermissions, permissionId]);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryPermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Remove all category permissions
      onPermissionsChange(selectedPermissions.filter(id => !categoryPermissionIds.includes(id)));
    } else {
      // Add all category permissions
      const newPermissions = [...selectedPermissions];
      categoryPermissionIds.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      onPermissionsChange(newPermissions);
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getCategorySelectionState = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    const selectedCount = categoryPermissionIds.filter(id => selectedPermissions.includes(id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryPermissionIds.length) return 'all';
    return 'partial';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">الصلاحيات</h3>
        <Badge variant="secondary">
          {selectedPermissions.length} صلاحية محددة
        </Badge>
      </div>

      <div className="space-y-3">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => {
          const isExpanded = expandedCategories[category];
          const selectionState = getCategorySelectionState(category);
          
          return (
            <Card key={category} className="border border-gray-200">
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleCategoryExpansion(category)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {categoryIcons[category]}
                          <CardTitle className="text-base">
                            {categoryNames[category] || category}
                          </CardTitle>
                        </div>
                        <Badge variant={selectionState === 'all' ? 'default' : selectionState === 'partial' ? 'secondary' : 'outline'}>
                          {permissions.filter(p => selectedPermissions.includes(p.id)).length} / {permissions.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryToggle(category);
                          }}
                          disabled={disabled}
                          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        >
                          {selectionState === 'all' ? 'إلغاء الكل' : 'تحديد الكل'}
                        </button>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                            disabled={disabled}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`permission-${permission.id}`}
                              className="block text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {permission.display_name}
                            </label>
                            {permission.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionsSelector;

