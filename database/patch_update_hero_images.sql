-- Patch: update hero_image paths to new local logos
USE learning_platform;
UPDATE courses SET hero_image = CASE
  WHEN title LIKE 'JavaScript%' THEN '/images/js-logo.svg'
  WHEN title LIKE 'React%' THEN '/images/react-logo.svg'
  WHEN title LIKE 'Node%' THEN '/images/node-logo.svg'
  ELSE hero_image END;