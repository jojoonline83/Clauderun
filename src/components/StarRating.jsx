export default function StarRating({ score, total, size = 'md' }) {
  const percentage = total > 0 ? score / total : 0;
  const stars = percentage === 1 ? 3 : percentage >= 0.7 ? 2 : percentage >= 0.4 ? 1 : 0;

  const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' };

  return (
    <div className="flex items-center gap-1 justify-center">
      {[1, 2, 3].map(s => (
        <span
          key={s}
          className={`${sizes[size]} transition-all duration-300 ${
            s <= stars ? 'animate-star-pop' : 'opacity-30 grayscale'
          }`}
          style={{ animationDelay: `${(s - 1) * 0.15}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
