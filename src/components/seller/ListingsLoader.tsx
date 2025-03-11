
export const ListingsLoader = () => {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex gap-4 border rounded-lg p-3 h-24 animate-pulse bg-gray-100"></div>
      ))}
    </div>
  );
};
