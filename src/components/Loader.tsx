
const Loader = () => {
  return (
    <div className="text-center py-12 text-gray-400 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
      <span className="ml-2">Loading orders...</span>
    </div>
  );
};

export default Loader;