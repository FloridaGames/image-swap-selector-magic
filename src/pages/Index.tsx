import SelectableImage from "@/components/SelectableImage";
import { useState } from "react";

const Index = () => {
  const [imageSrc, setImageSrc] = useState("https://dummyimage.com/1230x120/9e9e9e/fff");

  const handleImageChange = (newSrc: string) => {
    setImageSrc(newSrc);
    console.log("Image changed to:", newSrc);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Selectable Image Demo</h1>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Click on the image to select it, then use the "Change Image" button to upload a new one.
            </p>
          </div>

          <div className="grid-row" style={{ padding: "0%", position: "relative" }}>
            <SelectableImage
              src={imageSrc}
              alt="Homepage-img-2.png"
              targetWidth={1230}
              targetHeight={120}
              onImageChange={handleImageChange}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Original image source: {imageSrc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
