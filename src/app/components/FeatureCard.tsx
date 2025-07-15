type FeatureCardProps = {
    title: string;
    description: string;
    icon: React.ElementType;
}

export default function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
    return (
        <div className="bg-primary border border-darkGreen text-text rounded-lg p-6 shadow hover:shadow-lg transition">
            <Icon className="w-8 h-8 text-lightGreen mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-textSecondary">{description}</p>
        </div>
    );
}