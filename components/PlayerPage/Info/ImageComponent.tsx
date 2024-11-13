import Image from "next/image";
import { useState } from "react";

const ImageComponent = ({ imageUrl }: { imageUrl: string }) => {
  const [showPicture, setShowPicture] = useState(false);

  return (
    <div>
      {showPicture ? (
        <div>
          <Image
            src={imageUrl}
            alt="profile picture"
            sizes="100vw"
            width={500}
            height={500}
            style={{
              objectFit: "contain"
            }}
          ></Image>
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <button
          onClick={() => setShowPicture(!showPicture)}
          style={{ marginRight: "10px" }}
        >
          {showPicture ? "Piilota" : "Näytä kuva"}
        </button>
      </div>
    </div>
  );
};

export default ImageComponent;
