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
            width="100%"
            height="100%"
            layout="responsive"
            objectFit="contain"
            alt="profile picture"
          ></Image>
        </div>
      ) : null}
      <button onClick={() => setShowPicture(!showPicture)}>
        {showPicture ? "Piilota" : "Näytä kuva"}
      </button>
    </div>
  );
};

export default ImageComponent;
