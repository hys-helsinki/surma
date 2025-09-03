import Image from "next/image";
import { useState } from "react";

const ImageComponent = ({
  imageUrl,
  showPicture
}: {
  imageUrl: string;
  showPicture: boolean;
}) => {
  const imageLoader = ({ src }) => {
    return imageUrl;
  };

  return (
    <div>
      {showPicture ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            loader={imageLoader}
            unoptimized
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
    </div>
  );
};

export default ImageComponent;
