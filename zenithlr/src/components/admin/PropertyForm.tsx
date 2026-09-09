"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AmenitiesEditor, compactAmenities } from "./AmenitiesEditor";
import { BilingualField } from "./BilingualField";
import { DeleteListingButton } from "./DeleteListingButton";
import { PhotoUploader } from "./PhotoUploader";
import type { Listing, Localized } from "@/lib/types";

const emptyLocalized = (): Localized => ({ en: "", es: "" });

export function emptyListing(): Listing {
  return {
    id: "new",
    slug: "",
    propertyId: "",
    status: "draft",
    goals: ["sell"],
    featured: false,
    agentId: "bernal",
    title: emptyLocalized(),
    location: "Escazú",
    propertyType: "Apartment",
    price: 0,
    pricePeriod: "sale",
    currency: "USD",
    bedrooms: 1,
    bathrooms: 1,
    description: emptyLocalized(),
    specialFeatures: emptyLocalized(),
    amenities: [],
    faq: [],
    images: [],
  };
}

export function PropertyForm({ initial, isNew }: { initial?: Listing; isNew?: boolean }) {
  const router = useRouter();
  const [listing, setListing] = useState(initial ?? emptyListing());
  const [status, setStatus] = useState("");

  const toggleGoal = (goal: Listing["goals"][number]) => {
    setListing((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((item) => item !== goal)
        : [...prev.goals, goal],
    }));
  };

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = {
          ...listing,
          id: listing.id === "new" ? crypto.randomUUID() : listing.id,
          slug: listing.slug || listing.title.en.toLowerCase().replace(/\s+/g, "-"),
          amenities: compactAmenities(listing.amenities),
        };
        setStatus("Saving…");
        const res = await fetch(
          isNew ? "/api/listings" : `/api/listings/${listing.id}`,
          {
            method: isNew ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) {
          setStatus("Could not save");
          return;
        }
        router.push("/admin/properties");
        router.refresh();
      }}
    >
      <BilingualField
        label="Title"
        value={listing.title}
        onChange={(title) => setListing({ ...listing, title })}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs uppercase text-sand-deep">
          Slug
          <input
            className="admin-input mt-2"
            value={listing.slug}
            onChange={(e) => setListing({ ...listing, slug: e.target.value })}
          />
        </label>
        <label className="text-xs uppercase text-sand-deep">
          Property ID
          <input
            className="admin-input mt-2"
            value={listing.propertyId}
            onChange={(e) => setListing({ ...listing, propertyId: e.target.value })}
          />
        </label>
        <label className="text-xs uppercase text-sand-deep">
          Status
          <select
            className="admin-input mt-2"
            value={listing.status}
            onChange={(e) =>
              setListing({ ...listing, status: e.target.value as Listing["status"] })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {(["rent", "sell", "investment"] as const).map((goal) => (
          <label key={goal} className="flex items-center gap-2 capitalize">
            <input
              type="checkbox"
              checked={listing.goals.includes(goal)}
              onChange={() => toggleGoal(goal)}
            />
            {goal === "investment" ? "Real Estate Investments" : goal}
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={listing.featured}
            onChange={(e) => setListing({ ...listing, featured: e.target.checked })}
          />
          Featured
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-xs uppercase text-sand-deep">
          Location
          <input
            className="admin-input mt-2"
            value={listing.location}
            onChange={(e) => setListing({ ...listing, location: e.target.value })}
          />
        </label>
        <label className="text-xs uppercase text-sand-deep">
          Type
          <input
            className="admin-input mt-2"
            value={listing.propertyType}
            onChange={(e) => setListing({ ...listing, propertyType: e.target.value })}
          />
        </label>
        <label className="text-xs uppercase text-sand-deep">
          Price USD
          <input
            type="number"
            className="admin-input mt-2"
            value={listing.price}
            onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })}
          />
        </label>
        <label className="text-xs uppercase text-sand-deep">
          Period
          <select
            className="admin-input mt-2"
            value={listing.pricePeriod}
            onChange={(e) =>
              setListing({
                ...listing,
                pricePeriod: e.target.value as Listing["pricePeriod"],
              })
            }
          >
            <option value="sale">Sale</option>
            <option value="month">Monthly rent</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(
          [
            ["bedrooms", listing.bedrooms],
            ["bathrooms", listing.bathrooms],
            ["constructionArea", listing.constructionArea ?? 0],
            ["lotArea", listing.lotArea ?? 0],
            ["levels", listing.levels ?? 0],
            ["parking", listing.parking ?? 0],
            ["maintenanceFee", listing.maintenanceFee ?? 0],
            ["yearBuilt", listing.yearBuilt ?? 0],
          ] as const
        ).map(([key, value]) => (
          <label key={key} className="text-xs uppercase text-sand-deep">
            {key}
            <input
              type="number"
              className="admin-input mt-2"
              value={value}
              onChange={(e) =>
                setListing({ ...listing, [key]: Number(e.target.value) })
              }
            />
          </label>
        ))}
      </div>

      <BilingualField
        label="Description"
        multiline
        value={listing.description}
        onChange={(description) => setListing({ ...listing, description })}
      />
      <BilingualField
        label="Special features"
        multiline
        value={listing.specialFeatures}
        onChange={(specialFeatures) => setListing({ ...listing, specialFeatures })}
      />
      <AmenitiesEditor
        value={listing.amenities}
        onChange={(amenities) => setListing({ ...listing, amenities })}
      />

      <div>
        <p className="mb-3 text-xs uppercase text-sand-deep">Photos</p>
        <PhotoUploader
          multiple
          label="Upload photos"
          onUploaded={(urls) =>
            setListing((prev) => ({
              ...prev,
              images: [
                ...prev.images,
                ...urls.map((url, index) => ({
                  id: crypto.randomUUID(),
                  url,
                  isCover: prev.images.length === 0 && index === 0,
                  sortOrder: prev.images.length + index,
                })),
              ],
            }))
          }
        />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {listing.images.map((image) => (
            <div key={image.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="mt-2 flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setListing((prev) => ({
                      ...prev,
                      images: prev.images.map((item) => ({
                        ...item,
                        isCover: item.id === image.id,
                      })),
                    }))
                  }
                >
                  {image.isCover ? "Cover" : "Set cover"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setListing((prev) => ({
                      ...prev,
                      images: prev.images.filter((item) => item.id !== image.id),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="text-xs uppercase text-sand-deep">
        Agent
        <select
          className="admin-input mt-2"
          value={listing.agentId}
          onChange={(e) => setListing({ ...listing, agentId: e.target.value })}
        >
          <option value="bernal">Bernal Alvarado</option>
          <option value="harold">Harold Springer</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="bg-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase text-sand"
        >
          Save property
        </button>
        {!isNew && listing.id !== "new" && (
          <DeleteListingButton
            id={listing.id}
            label={listing.title.en || listing.title.es}
            redirectTo="/admin/properties"
          />
        )}
        {status && <p className="self-center text-sm text-sand-deep">{status}</p>}
      </div>
    </form>
  );
}
