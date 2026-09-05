"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_ACCENT,
  COLOR,
  Product,
  toRupiah,
} from "@/src/lib/constants";
import { HeartButton } from "./ui";

const VISITOR_ID_KEY =
  "heriyati-wedding-visitor-id";

function getVisitorId() {
  const existing =
    localStorage.getItem(
      VISITOR_ID_KEY
    );

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();

  localStorage.setItem(
    VISITOR_ID_KEY,
    id
  );

  return id;
}

export default function ProductCard({
  product,
  wishlisted,
  onToggleWishlist,
  onOpen,
}: {
  product: Product;
  wishlisted: boolean;
    onToggleWishlist: (
      id: string
    ) => void;
    onOpen: (
      product: Product
    ) => void;
}) {
  const accent =
    CATEGORY_ACCENT[
    product.category
    ] || COLOR.ink;

  const imageUrl =
    product.image?.[0] || "";

  const [heartCount, setHeartCount] =
    useState(0);

  useEffect(() => {
    async function loadHeart() {
      try {
        const response =
          await fetch(
            `/api/heart?productId=${encodeURIComponent(
              product.id
            )}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (result.success) {
          setHeartCount(
            Number(
              result.data?.count ?? 0
            )
          );
        }
      } catch (error) {
        console.error(
          "Gagal mengambil heart:",
          error
        );
      }
    }

    void loadHeart();
  }, [product.id]);

  async function handleWishlist() {
    const visitorId =
      getVisitorId();

    try {
      const response =
        await fetch(
          "/api/heart",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              visitorId,
              productId:
                product.id,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message
        );
      }

      setHeartCount(
        Number(
          result.data?.count ??
          heartCount
        )
      );

      onToggleWishlist(
        product.id
      );
    } catch (error) {
      console.error(
        "Gagal memberikan heart:",
        error
      );
    }
  }

  return (
    <article
      className="product-card"
      onClick={() =>
        onOpen(product)
      }
    >
      <div
        className="product-art"
        style={{
          position: "relative",
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : "none",
          backgroundColor:
            COLOR.paper,
          backgroundSize: "cover",
          backgroundPosition:
            "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <HeartButton
            active={wishlisted}
            onClick={() =>
              void handleWishlist()
            }
          />

          {heartCount > 0 && (
            <span
              className="body-font"
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: COLOR.inkSoft,
                background:
                  COLOR.paper,
                padding:
                  "3px 6px",
                borderRadius: 999,
              }}
            >
              {heartCount.toLocaleString(
                "id-ID"
              )}
            </span>
          )}
        </div>

        <div
          className="product-badge"
          style={{
            backgroundColor: accent,
            color: COLOR.paper,
          }}
        >
          {product.category}
        </div>
      </div>

      <div
        style={{
          padding: 12,
        }}
      >
        <p
          className="display-font"
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {product.name}
        </p>

        <p
          className="body-font"
          style={{
            margin:
              "4px 0 0",
            fontSize: 14,
            fontWeight: 800,
            color: accent,
          }}
        >
          {toRupiah(
            product.price
          )}
        </p>

        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            marginTop: 6,
          }}
        >
          {(product.tags || [])
            .slice(0, 2)
            .map((tag) => (
              <span
                key={tag}
                className="body-font"
                style={{
                  fontSize: 10,
                  color:
                    COLOR.inkSoft,
                }}
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
    </article>
  );
}