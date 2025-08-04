import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import seaborn as sns
import matplotlib.dates as mdates
from matplotlib import font_manager
import warnings
warnings.filterwarnings('ignore')

# Set up Arabic font support
plt.rcParams['font.family'] = ['DejaVu Sans', 'Arial Unicode MS', 'Tahoma']
plt.rcParams['axes.unicode_minus'] = False

# Create sample POS data
np.random.seed(42)

# Generate sample data for the last 30 days
dates = [datetime.now() - timedelta(days=x) for x in range(30, 0, -1)]
daily_sales = np.random.normal(12000, 2500, 30)
daily_sales = np.maximum(daily_sales, 5000)  # Ensure minimum sales

# Product categories data
categories = ['مشروبات', 'وجبات سريعة', 'حلويات', 'مخبوزات', 'منتجات ألبان', 'خضروات وفواكه']
category_sales = [25000, 35000, 15000, 20000, 12000, 18000]
category_colors = ['#4080FF', '#57A9FB', '#37D4CF', '#23C343', '#FBE842', '#FF9A2E']

# Hourly sales pattern
hours = list(range(24))
hourly_pattern = [200, 150, 100, 80, 90, 150, 300, 500, 800, 1200, 1500, 1800, 
                 2000, 1800, 1600, 1400, 1200, 1000, 800, 600, 500, 400, 300, 250]

# Payment methods
payment_methods = ['نقدي', 'بطاقة ائتمان', 'محفظة إلكترونية', 'تحويل بنكي']
payment_amounts = [45000, 35000, 15000, 8000]

# Top selling products
products = ['برجر كلاسيك', 'بيتزا مارجريتا', 'عصير برتقال', 'قهوة أمريكانو', 'كيك شوكولاتة', 
           'ساندويش تونة', 'سلطة خضراء', 'مياه معدنية']
product_quantities = [120, 95, 180, 150, 75, 85, 60, 200]

# Create visualizations
fig = plt.figure(figsize=(20, 24))

# 1. Daily Sales Trend (Line Chart)
plt.subplot(4, 2, 1)
plt.plot(dates, daily_sales, linewidth=3, color='#4080FF', marker='o', markersize=6)
plt.title('اتجاه المبيعات اليومية (آخر 30 يوم)', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('التاريخ', fontsize=12)
plt.ylabel('المبيعات (جنيه مصري)', fontsize=12)
plt.grid(True, alpha=0.3, linestyle='--')
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=5))
plt.xticks(rotation=45)
plt.tight_layout()

# Add trend line
z = np.polyfit(range(len(daily_sales)), daily_sales, 1)
p = np.poly1d(z)
plt.plot(dates, p(range(len(daily_sales))), "--", alpha=0.7, color='#FF9A2E', linewidth=2)

# 2. Sales by Category (Pie Chart)
plt.subplot(4, 2, 2)
wedges, texts, autotexts = plt.pie(category_sales, labels=categories, autopct='%1.1f%%', 
                                  colors=category_colors, startangle=90, textprops={'fontsize': 10})
plt.title('توزيع المبيعات حسب الفئة', fontsize=16, fontweight='bold', pad=20)

# 3. Hourly Sales Pattern (Bar Chart)
plt.subplot(4, 2, 3)
bars = plt.bar(hours, hourly_pattern, color='#37D4CF', alpha=0.8, edgecolor='white', linewidth=1)
plt.title('نمط المبيعات خلال ساعات اليوم', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('الساعة', fontsize=12)
plt.ylabel('متوسط المبيعات (جنيه)', fontsize=12)
plt.grid(True, alpha=0.3, axis='y', linestyle='--')
plt.xticks(range(0, 24, 2))

# Highlight peak hours
peak_hours = [11, 12, 13, 14]
for i, bar in enumerate(bars):
    if i in peak_hours:
        bar.set_color('#23C343')

# 4. Payment Methods Distribution (Horizontal Bar Chart)
plt.subplot(4, 2, 4)
bars = plt.barh(payment_methods, payment_amounts, color=['#4080FF', '#57A9FB', '#FBE842', '#A9AEB8'])
plt.title('توزيع طرق الدفع', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('المبلغ (جنيه مصري)', fontsize=12)
plt.grid(True, alpha=0.3, axis='x', linestyle='--')

# Add value labels on bars
for i, (method, amount) in enumerate(zip(payment_methods, payment_amounts)):
    plt.text(amount + 1000, i, f'{amount:,}', va='center', fontsize=10, fontweight='bold')

# 5. Top Selling Products (Bar Chart)
plt.subplot(4, 2, 5)
bars = plt.bar(range(len(products)), product_quantities, color=category_colors[:len(products)])
plt.title('أكثر المنتجات مبيعاً', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('المنتجات', fontsize=12)
plt.ylabel('الكمية المباعة', fontsize=12)
plt.xticks(range(len(products)), products, rotation=45, ha='right')
plt.grid(True, alpha=0.3, axis='y', linestyle='--')

# Add value labels on bars
for i, qty in enumerate(product_quantities):
    plt.text(i, qty + 5, str(qty), ha='center', va='bottom', fontsize=10, fontweight='bold')

# 6. Monthly Revenue Comparison (Bar Chart)
plt.subplot(4, 2, 6)
months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
monthly_revenue = [320000, 285000, 410000, 375000, 445000, 390000]
current_month = len(months) - 1

bars = plt.bar(months, monthly_revenue, color=['#A9AEB8' if i != current_month else '#23C343' for i in range(len(months))])
plt.title('مقارنة الإيرادات الشهرية', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('الشهر', fontsize=12)
plt.ylabel('الإيراد (جنيه مصري)', fontsize=12)
plt.grid(True, alpha=0.3, axis='y', linestyle='--')

# Add value labels
for i, revenue in enumerate(monthly_revenue):
    plt.text(i, revenue + 10000, f'{revenue:,}', ha='center', va='bottom', fontsize=10, fontweight='bold')

# 7. Sales Performance Dashboard (Combined metrics)
plt.subplot(4, 2, 7)
plt.axis('off')

# Create a dashboard-style layout
dashboard_data = {
    'إجمالي المبيعات اليوم': '12,450 ج.م',
    'عدد الفواتير': '48',
    'متوسط قيمة الفاتورة': '259 ج.م',
    'أعلى مبيعات في الساعة': '2,000 ج.م',
    'نمو المبيعات': '+12.5%',
    'عدد العملاء': '156'
}

y_pos = 0.9
for metric, value in dashboard_data.items():
    plt.text(0.1, y_pos, metric + ':', fontsize=14, fontweight='bold', transform=plt.gca().transAxes)
    plt.text(0.7, y_pos, value, fontsize=14, color='#4080FF', fontweight='bold', transform=plt.gca().transAxes)
    y_pos -= 0.15

plt.title('لوحة معلومات الأداء', fontsize=16, fontweight='bold', pad=20)

# 8. Weekly Sales Comparison (Line Chart)
plt.subplot(4, 2, 8)
weeks = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4']
current_month_weekly = [85000, 92000, 88000, 95000]
previous_month_weekly = [78000, 85000, 82000, 88000]

plt.plot(weeks, current_month_weekly, marker='o', linewidth=3, color='#4080FF', label='الشهر الحالي', markersize=8)
plt.plot(weeks, previous_month_weekly, marker='s', linewidth=3, color='#FF9A2E', label='الشهر السابق', markersize=8)
plt.title('مقارنة المبيعات الأسبوعية', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('الأسبوع', fontsize=12)
plt.ylabel('المبيعات (جنيه مصري)', fontsize=12)
plt.legend(fontsize=12)
plt.grid(True, alpha=0.3, linestyle='--')

# Adjust layout and save
plt.tight_layout(pad=3.0)
plt.savefig('/home/ubuntu/pos_dashboard_charts.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
plt.close()

# Create individual charts for better display
# Chart 1: Sales Trend
fig, ax = plt.subplots(figsize=(12, 6))
ax.plot(dates, daily_sales, linewidth=3, color='#4080FF', marker='o', markersize=6)
ax.set_title('اتجاه المبيعات اليومية (آخر 30 يوم)', fontsize=18, fontweight='bold', pad=20)
ax.set_xlabel('التاريخ', fontsize=14)
ax.set_ylabel('المبيعات (جنيه مصري)', fontsize=14)
ax.grid(True, alpha=0.3, linestyle='--')
ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=5))
plt.xticks(rotation=45)

# Add trend line
z = np.polyfit(range(len(daily_sales)), daily_sales, 1)
p = np.poly1d(z)
ax.plot(dates, p(range(len(daily_sales))), "--", alpha=0.7, color='#FF9A2E', linewidth=2, label='خط الاتجاه')
ax.legend(fontsize=12)

plt.tight_layout()
plt.savefig('/home/ubuntu/sales_trend_chart.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
plt.close()

# Chart 2: Category Distribution
fig, ax = plt.subplots(figsize=(10, 8))
wedges, texts, autotexts = ax.pie(category_sales, labels=categories, autopct='%1.1f%%', 
                                 colors=category_colors, startangle=90, textprops={'fontsize': 12})
ax.set_title('توزيع المبيعات حسب الفئة', fontsize=18, fontweight='bold', pad=20)

plt.tight_layout()
plt.savefig('/home/ubuntu/category_distribution_chart.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
plt.close()

# Chart 3: Hourly Pattern
fig, ax = plt.subplots(figsize=(12, 6))
bars = ax.bar(hours, hourly_pattern, color='#37D4CF', alpha=0.8, edgecolor='white', linewidth=1)
ax.set_title('نمط المبيعات خلال ساعات اليوم', fontsize=18, fontweight='bold', pad=20)
ax.set_xlabel('الساعة', fontsize=14)
ax.set_ylabel('متوسط المبيعات (جنيه)', fontsize=14)
ax.grid(True, alpha=0.3, axis='y', linestyle='--')
ax.set_xticks(range(0, 24, 2))

# Highlight peak hours
peak_hours = [11, 12, 13, 14]
for i, bar in enumerate(bars):
    if i in peak_hours:
        bar.set_color('#23C343')

plt.tight_layout()
plt.savefig('/home/ubuntu/hourly_pattern_chart.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
plt.close()

print("تم إنشاء جميع الرسوم البيانية بنجاح!")
print("الملفات المحفوظة:")
print("1. pos_dashboard_charts.png - لوحة معلومات شاملة")
print("2. sales_trend_chart.png - اتجاه المبيعات اليومية")
print("3. category_distribution_chart.png - توزيع المبيعات حسب الفئة")
print("4. hourly_pattern_chart.png - نمط المبيعات خلال اليوم")

