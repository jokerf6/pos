import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Unit {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const Units: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.invoke('units:getAll');
      if (result.success) {
        setUnits(result.data);
      } else {
        toast.error('فشل في تحميل الوحدات');
      }
    } catch (error) {
      toast.error('خطأ في تحميل الوحدات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) {
      toast.error('يرجى إدخال اسم الوحدة');
      return;
    }

    try {
      let result;
      if (editingUnit) {
        result = await window.electronAPI.invoke('units:update', {
          id: editingUnit.id,
          name: unitName.trim()
        });
      } else {
        result = await window.electronAPI.invoke('units:create', {
          name: unitName.trim()
        });
      }

      if (result.success) {
        toast.success(editingUnit ? 'تم تحديث الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح');
        setIsDialogOpen(false);
        setEditingUnit(null);
        setUnitName('');
        fetchUnits();
      } else {
        toast.error(result.error || 'فشل في حفظ الوحدة');
      }
    } catch (error) {
      toast.error('خطأ في حفظ الوحدة');
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      return;
    }

    try {
      const result = await window.electronAPI.invoke('units:delete', id);
      if (result.success) {
        toast.success('تم حذف الوحدة بنجاح');
        fetchUnits();
      } else {
        toast.error(result.error || 'فشل في حذف الوحدة');
      }
    } catch (error) {
      toast.error('خطأ في حذف الوحدة');
    }
  };

  const openAddDialog = () => {
    setEditingUnit(null);
    setUnitName('');
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة الوحدات</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة وحدة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="unitName">اسم الوحدة</Label>
                  <Input
                    id="unitName"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="مثال: كيلو، قطعة، لتر"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingUnit ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرقم</TableHead>
                  <TableHead>اسم الوحدة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      لا توجد وحدات مضافة
                    </TableCell>
                  </TableRow>
                ) : (
                  units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{unit.id}</TableCell>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell>
                        {new Date(unit.created_at).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(unit)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(unit.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Units;

