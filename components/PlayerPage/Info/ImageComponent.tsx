import Image from "next/legacy/image";
import { useState } from "react";

const ImageComponent = ({ imageUrl }: { imageUrl: string }) => {
  const [showPicture, setShowPicture] = useState(false);

  return (
    <div>
      {showPicture ? (
        <div>
          <Image
            src={imageUrl}
            width="100%"
            height="100%"
            layout="responsive"
            objectFit="contain"
            alt="profile picture"
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
