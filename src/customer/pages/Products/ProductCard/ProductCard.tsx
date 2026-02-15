import "./ProductCard.css";
import React, { useState, useEffect } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import { teal } from "@mui/material/colors";
import { Box, Button, Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { Product } from "../../../../types/productTypes";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../Redux Toolkit/Store";
import { addProductToWishlist } from "../../../../Redux Toolkit/Customer/WishlistSlice";
import { isWishlisted } from "../../../../util/isWishlisted";
import ChatBot from "../../ChatBot/ChatBot";

interface ProductCardProps {
  item: Product;
  categoryId: string;
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: ".5rem",
  boxShadow: 24,
};

const ProductCard: React.FC<ProductCardProps> = ({ item, categoryId }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);

  const { wishlist } = useAppSelector((store) => store);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAddWishlist = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    if (item._id) {
      dispatch(addProductToWishlist({ productId: item._id }));
    }
  };

  const handleShowChatBot = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setShowChatBot(true);
  };

  const handleCloseChatBot = () => {
    setShowChatBot(false);
  };

  useEffect(() => {
    if (!isHovered || !item.images || item.images.length <= 1) return;

    let interval: ReturnType<typeof setInterval>;

    interval = setInterval(() => {
      setCurrentImage((prev) =>
        (prev + 1) % item.images.length
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, item.images]);

  return (
    <>
      <div
        className="group px-4 relative"
        onClick={() =>
          navigate(
            `/product-details/${categoryId}/${item.title}/${item._id}`
          )
        }
      >
        <div
          className="card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {item.images?.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`product-${index}`}
              className="card-media object-top"
              style={{
                transform: `translateX(${(index - currentImage) * 100}%)`,
              }}
            />
          ))}

          {isHovered && (
            <div className="indicator flex flex-col items-center space-y-2">
              <div className="flex gap-3">
                {item.images?.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator-button ${
                      index === currentImage ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImage(index);
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {wishlist.wishlist && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAddWishlist}
                  >
                    {isWishlisted(wishlist.wishlist, item) ? (
                      <FavoriteIcon sx={{ color: teal[500] }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: "gray" }} />
                    )}
                  </Button>
                )}

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleShowChatBot}
                >
                  <ModeCommentIcon sx={{ color: teal[500] }} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="details pt-3 space-y-1">
          <h1 className="font-semibold text-lg">
            {item.seller?.businessDetails?.businessName}
          </h1>
          <p>{item.title}</p>

          <div className="price flex gap-3">
            <span className="font-semibold">
              ₹{item.sellingPrice}
            </span>
            <span className="line-through text-gray-400">
              ₹{item.mrpPrice}
            </span>
            <span className="text-[#00927c] font-semibold">
              {item.discountPercent}% off
            </span>
          </div>
        </div>
      </div>

      <Modal open={showChatBot} onClose={handleCloseChatBot}>
        <Box sx={modalStyle}>
          {item._id && (
            <ChatBot
              handleClose={handleCloseChatBot}
              productId={item._id}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ProductCard;
