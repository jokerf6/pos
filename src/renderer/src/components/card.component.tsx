// components/Card.tsx

interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  imageUrl,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md  overflow-hidden max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300 w-full">
      <div className="p-4 text-center" dir="rtl">
        <h2 className=" font-black text-[21px]">{title}</h2>
        <p className="text-gray-600">{description}</p>
        {children}
      </div>
    </div>
  );
};
