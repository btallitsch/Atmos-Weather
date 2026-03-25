interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Locating you…' }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <div className="loading-orb">
        <div className="loading-orb-inner" />
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
