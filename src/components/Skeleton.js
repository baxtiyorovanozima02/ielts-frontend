function Skeleton({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            backgroundColor: '#1e2d45',
            backgroundImage: 'linear-gradient(90deg, #1e2d45 25%, #243552 50%, #1e2d45 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            ...style,
        }} />
    );
}

export default Skeleton;