import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon,
  iconColorClass = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  description,
  ...props
}) => {
  return (
    <Card hoverable {...props}>
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-100 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconColorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {trend && (
          <span className={`
            inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-lg
            ${trendType === 'up' ? 'text-emerald-400 bg-emerald-500/10' : ''}
            ${trendType === 'down' ? 'text-red-400 bg-red-500/10' : ''}
            ${trendType === 'neutral' ? 'text-slate-400 bg-slate-500/10' : ''}
          `}>
            {trendType === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
        {description && (
          <span className="text-xs text-slate-500 font-medium">{description}</span>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
