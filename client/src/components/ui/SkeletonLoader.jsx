const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 shimmer"></div>
      <div className="p-5">
        <div className="h-4 bg-gray-200 rounded shimmer mb-3"></div>
        <div className="h-3 bg-gray-200 rounded shimmer mb-2 w-3/4"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-gray-200 rounded shimmer w-20"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full shimmer"></div>
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 bg-gray-200 rounded shimmer"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded shimmer mb-2"></div>
          <div className="h-3 bg-gray-200 rounded shimmer w-2/3"></div>
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded shimmer"></div>
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b animate-pulse">
        <div className="h-4 bg-gray-200 rounded shimmer w-1/4"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border-b animate-pulse" style={{animationDelay: `${i * 0.1}s`}}>
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 rounded shimmer w-1/6"></div>
            <div className="h-3 bg-gray-200 rounded shimmer w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded shimmer w-1/6"></div>
            <div className="h-3 bg-gray-200 rounded shimmer w-1/6"></div>
            <div className="h-6 w-16 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center space-x-6 mb-6">
        <div className="h-20 w-20 bg-gray-200 rounded-full shimmer"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded shimmer mb-2 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2" style={{animationDelay: `${i * 0.1}s`}}>
            <div className="h-3 bg-gray-200 rounded shimmer w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'table':
        return <TableSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  if (type === 'table' || type === 'profile') {
    return renderSkeleton();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} style={{animationDelay: `${index * 0.1}s`}}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;