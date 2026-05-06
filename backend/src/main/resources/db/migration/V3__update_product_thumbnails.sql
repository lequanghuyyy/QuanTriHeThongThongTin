-- Update thumbnailUrl for products that don't have one but have images
UPDATE products p
SET thumbnail_url = (
    SELECT pi.image_url 
    FROM product_images pi 
    WHERE pi.product_id = p.id 
    ORDER BY pi.is_primary DESC, pi.sort_order ASC 
    LIMIT 1
)
WHERE (p.thumbnail_url IS NULL OR p.thumbnail_url = '')
  AND EXISTS (
    SELECT 1 FROM product_images pi2 WHERE pi2.product_id = p.id
  );
