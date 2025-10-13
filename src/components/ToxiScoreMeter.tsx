interface ToxiScoreMeterProps {
  score: number;
  colorCode: "green" | "yellow" | "red";
}

const ToxiScoreMeter = ({ score, colorCode }: ToxiScoreMeterProps) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColorClass = () => {
    switch (colorCode) {
      case "green":
        return "text-success";
      case "yellow":
        return "text-warning";
      case "red":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getStrokeColor = () => {
    switch (colorCode) {
      case "green":
        return "hsl(var(--success))";
      case "yellow":
        return "hsl(var(--warning))";
      case "red":
        return "hsl(var(--danger))";
      default:
        return "hsl(var(--muted))";
    }
  };

  const getLabel = () => {
    if (score >= 70) return "Safe";
    if (score >= 40) return "Moderate";
    return "Avoid";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            fill="none"
            opacity="0.2"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${getColorClass()}`}>
            {Math.round(score)}
          </span>
          <span className="text-sm text-muted-foreground mt-1">
            ToxiScore
          </span>
        </div>
      </div>

      <div className={`text-xl font-semibold ${getColorClass()}`}>
        {getLabel()}
      </div>
    </div>
  );
};

export default ToxiScoreMeter;
