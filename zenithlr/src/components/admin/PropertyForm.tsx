"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AmenitiesEditor, compactAmenities } from "./AmenitiesEditor";
import { BilingualField } from "./BilingualField";
import { DeleteListingButton } from "./DeleteListingButton";
import { PhotoUploader } from "./PhotoUploader";
import {
  appendListingImages,
  moveListingImages,
  pinCoverFirst,
  removeListingImages,
  setListingCover,
} from "@/lib/listing-images";
import { normalizePropertyType } from "@/lib/property-type";
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
    propertyType: { en: "Apartment", es: "Apartamento" },
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
  const [listing, setListing] = useState(() => {
    const source = initial ?? emptyListing();
    return {
      ...source,
      propertyType: normalizePropertyType(source.propertyType),
      images: pinCoverFirst(source.images),
    };
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const removeImages = (ids: string[]) => {
    const idSet = new Set(ids);
    setListing((prev) => ({
      ...prev,
      images: removeListingImages(prev.images, idSet),
    }));
    setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)));
  };

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
      onDragOver={(e) => {
        if ([...e.dataTransfer.types].includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        if ([...e.dataTransfer.types].includes("Files")) e.preventDefault();
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = {
          ...listing,
          id: listing.id === "new" ? crypto.randomUUID() : listing.id,
          slug: listing.slug || listing.title.en.toLowerCase().replace(/\s+/g, "-"),
          amenities: compactAmenities(listing.amenities),
          propertyType: normalizePropertyType(listing.propertyType),
          images: pinCoverFirst(listing.images),
        };
        // Keep URL-safe slug even if the admin typed spaces or accents
        payload.slug = payload.slug
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80) || payload.id;
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

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs uppercase text-sand-deep">
          Location
          <input
            className="admin-input mt-2"
            value={listing.location}
            onChange={(e) => setListing({ ...listing, location: e.target.value })}
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
      <BilingualField
        label="Type"
        value={listing.propertyType}
        onChange={(propertyType) => setListing({ ...listing, propertyType })}
      />

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
              images: appendListingImages(prev.images, urls),
            }))
          }
        />
        {listing.images.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-sand-deep">
            <p className="w-full">
              Drag to reorder photos. The cover stays first; use Set cover to change it.
            </p>
            <button type="button" onClick={() => setSelectedIds(listing.images.map((image) => image.id))}>
              Select all
            </button>
            <button
              type="button"
              className="disabled:opacity-40"
              disabled={selectedIds.length === 0}
              onClick={() => setSelectedIds([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="disabled:opacity-40"
              disabled={selectedIds.length === 0}
              onClick={() => {
                const count = selectedIds.length;
                if (
                  !confirm(
                    `Remove ${count} photo${count === 1 ? "" : "s"} from this listing?`,
                  )
                ) {
                  return;
                }
                removeImages(selectedIds);
              }}
            >
              Delete selected ({selectedIds.length})
            </button>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {listing.images.map((image) => {
            const selected = selectedIds.includes(image.id);
            return (
              <div
                key={image.id}
                className={`relative ${draggingId === image.id ? "opacity-60" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  const dragId = draggingIdRef.current;
                  if (!dragId || dragId === image.id || image.isCover || overId === image.id) {
                    return;
                  }
                  setOverId(image.id);
                  setListing((prev) => ({
                    ...prev,
                    images: moveListingImages(prev.images, dragId, image.id),
                  }));
                }}
                onDrop={(e) => e.preventDefault()}
              >
                <label className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center bg-cream/90">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelected(image.id)}
                    aria-label="Select photo"
                  />
                </label>
                {!image.isCover && (
                  <div
                    draggable
                    role="button"
                    tabIndex={0}
                    aria-label="Reorder photo"
                    className="absolute right-2 top-2 z-10 cursor-grab bg-cream/90 px-1.5 py-1 text-ink/35 hover:text-ink active:cursor-grabbing"
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", image.id);
                      draggingIdRef.current = image.id;
                      setDraggingId(image.id);
                      setOverId(null);
                    }}
                    onDragEnd={() => {
                      draggingIdRef.current = null;
                      setDraggingId(null);
                      setOverId(null);
                    }}
                  >
                    <DragHandleIcon />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleSelected(image.id)}
                  className={`block w-full ${selected ? "ring-2 ring-ink ring-offset-2" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
                <div className="mt-2 flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setListing((prev) => ({
                        ...prev,
                        images: setListingCover(prev.images, image.id),
                      }))
                    }
                  >
                    {image.isCover ? "Cover" : "Set cover"}
                  </button>
                  <button type="button" onClick={() => removeImages([image.id])}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
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

function DragHandleIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden>
      <circle cx="4" cy="3" r="1.4" />
      <circle cx="10" cy="3" r="1.4" />
      <circle cx="4" cy="9" r="1.4" />
      <circle cx="10" cy="9" r="1.4" />
      <circle cx="4" cy="15" r="1.4" />
      <circle cx="10" cy="15" r="1.4" />
    </svg>
  );
}
