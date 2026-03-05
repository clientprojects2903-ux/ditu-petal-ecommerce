"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BannerManager() {
  const [banners, setBanners] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const websiteName = "Main Website";

  useEffect(() => {
    initWebsite();
  }, []);

  const initWebsite = async () => {
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("name", websiteName)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Fetch error:", error);
      return;
    }

    if (!data) {
      const { data: newRow, error: insertError } = await supabase
        .from("websites")
        .insert({ name: websiteName })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return;
      }

      setBanners(newRow);
    } else {
      setBanners(data);
    }
  };

  const uploadBanner = async (file: File, bannerNumber: number) => {
    if (!banners) return;

    setLoading(true);

    const ext = file.name.split(".").pop();
    const filePath = `hero_banners/banner${bannerNumber}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("website-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage
      .from("website-assets")
      .getPublicUrl(filePath);

    const column = `hero_banner${bannerNumber}`;

    const { error: updateError } = await supabase
      .from("websites")
      .update({ [column]: data.publicUrl })
      .eq("id", banners.id);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    setBanners((prev: any) => ({
      ...prev,
      [column]: data.publicUrl,
    }));

    setLoading(false);
  };

  const BannerInput = ({ num }: { num: number }) => {
    const bannerUrl = banners?.[`hero_banner${num}`];

    return (
      <div style={{ marginBottom: 40 }}>
        <h3>Hero Banner {num}</h3>

        {bannerUrl && (
          <img
            src={bannerUrl}
            width="400"
            style={{
              display: "block",
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadBanner(file, num);
          }}
        />
      </div>
    );
  };

  if (!banners) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Loading banner system...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <h1>Hero Banner Manager</h1>

      {loading && <p>Uploading image...</p>}

      <BannerInput num={1} />
      <BannerInput num={2} />
      <BannerInput num={3} />
      <BannerInput num={4} />
      <BannerInput num={5} />
    </div>
  );
}