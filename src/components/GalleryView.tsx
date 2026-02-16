import { Camera, Calendar, Scale } from "lucide-react";
import type { WeightEntry } from "@/types/bulking";

interface GalleryViewProps {
    weightHistory: WeightEntry[];
}

export default function GalleryView({ weightHistory }: GalleryViewProps) {
    const images = (weightHistory || [])
        .filter((entry) => entry.image)
        .slice()
        .reverse();

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-fade-in">
                <div className="p-4 rounded-full bg-secondary">
                    <Camera className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-bold">Belum Ada Foto</h2>
                    <p className="text-sm text-muted-foreground w-64 mx-auto">
                        Upload foto saat mencatat berat badan di tab Progress untuk melihat transformasi Anda.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-bold">
                    Galeri <span className="text-gradient">Transformasi</span> ✨
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Lihat perubahan fisik Anda dari waktu ke waktu.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {images.map((entry, index) => (
                    <div key={index} className="glass-card rounded-2xl overflow-hidden group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="relative aspect-[3/4] overflow-hidden">
                            <img
                                src={entry.image}
                                alt={`Progress ${entry.date}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 left-3 right-3 space-y-1">
                                <div className="flex items-center gap-1.5 text-primary">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{entry.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-foreground">
                                    <Scale className="h-3 w-3" />
                                    <span className="text-xs font-bold">{entry.weight} kg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
