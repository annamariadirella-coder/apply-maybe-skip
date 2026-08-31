(function attachJobPageData(globalScope) {
  const JOB_ROOT_SELECTORS = [
    ".jobs-search__job-details--container",
    ".jobs-details",
    "[data-testid='job-details']",
    "[data-job-details]",
    "main article",
    "article",
    "main",
    "[role='main']",
  ];

  const LOCATION_SELECTORS = [
    "[data-testid='job-location']",
    "[data-automation-id='locations']",
    ".job-location",
    ".jobs-unified-top-card__primary-description-container",
    ".job-details-jobs-unified-top-card__primary-description-container",
    ".job-details-jobs-unified-top-card__primary-description",
    "[class*='jobs-unified-top-card'][class*='primary-description']",
    "[class*='job-details'][class*='top-card']",
  ];

  const DESCRIPTION_SELECTORS = [
    "[data-testid='job-description']",
    "[data-automation-id='jobPostingDescription']",
    ".jobs-description__content",
    ".jobs-description-content__text",
    ".jobs-box__html-content",
    ".jobs-description",
    "[class*='jobs-description']",
    "[class*='job-description']",
  ];

  function cleanText(value = "") {
    return String(value).replace(/\s+/g, " ").trim();
  }

  function htmlToText(value = "") {
    return cleanText(
      String(value)
        .replace(/<(?:br|hr)\s*\/?\s*>/gi, " ")
        .replace(/<\/(?:p|li|div|h[1-6])>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;|&#34;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">"),
    );
  }

  function values(value) {
    return Array.isArray(value) ? value : value == null ? [] : [value];
  }

  function typeIncludes(value, expectedType) {
    return values(value).some(
      (type) => cleanText(type).toLowerCase() === expectedType.toLowerCase(),
    );
  }

  function findJobPosting(structuredData) {
    const pending = values(structuredData);

    while (pending.length > 0) {
      const current = pending.shift();

      if (!current || typeof current !== "object") {
        continue;
      }

      if (typeIncludes(current["@type"], "JobPosting")) {
        return current;
      }

      Object.values(current).forEach((value) => {
        if (value && typeof value === "object") {
          pending.push(...values(value));
        }
      });
    }

    return null;
  }

  function readStructuredJobPosting(root) {
    const scripts = root?.querySelectorAll?.(
      'script[type="application/ld+json"]',
    ) ?? [];

    for (const script of scripts) {
      try {
        const posting = findJobPosting(JSON.parse(script.textContent ?? ""));

        if (posting) {
          return posting;
        }
      } catch {
        // Invalid third-party metadata should not prevent the page fallback.
      }
    }

    return null;
  }

  function namedValue(value) {
    if (typeof value === "string") {
      return cleanText(value);
    }

    return cleanText(value?.name ?? value?.value ?? "");
  }

  function structuredLocation(posting = {}) {
    const parts = [];
    const locationTypes = values(posting.jobLocationType).map(namedValue);

    if (
      locationTypes.some((type) =>
        /telecommute|remote|work from home/i.test(type),
      )
    ) {
      parts.push("Remote");
    }

    values(posting.jobLocation).forEach((location) => {
      const address = location?.address ?? location;
      parts.push(
        namedValue(location),
        namedValue(address?.addressLocality),
        namedValue(address?.addressRegion),
        namedValue(address?.addressCountry),
      );
    });

    values(posting.applicantLocationRequirements).forEach((location) => {
      parts.push(namedValue(location));
    });

    return [...new Set(parts.map(cleanText).filter(Boolean))].join(" · ");
  }

  function structuredText(posting = {}) {
    return [
      posting.description,
      posting.responsibilities,
      posting.qualifications,
      posting.skills,
      posting.experienceRequirements,
    ]
      .flatMap(values)
      .map((value) => htmlToText(namedValue(value)))
      .filter(Boolean)
      .join(" ");
  }

  function combineLocations(...locations) {
    return [
      ...new Set(
        locations
          .flatMap((location) => String(location ?? "").split(/\s*[·|]\s*/))
          .map(cleanText)
          .filter(Boolean),
      ),
    ].join(" · ");
  }

  function firstElement(root, selectors) {
    for (const selector of selectors) {
      const element = root?.querySelector?.(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function descriptionFromHeading(root) {
    const headings = root?.querySelectorAll?.(
      "h2, h3, [role='heading']",
    ) ?? [];
    const descriptionHeading = [...headings].find((heading) =>
      /^(?:about the job|job description|about the role)$/i.test(
        cleanText(heading?.innerText ?? heading?.textContent),
      ),
    );

    if (!descriptionHeading) {
      return null;
    }

    let current = descriptionHeading.parentElement;
    let best = null;

    for (let depth = 0; current && depth < 5; depth += 1) {
      const text = elementText(current);

      if (text.length >= 120) {
        best = current;
        break;
      }

      current = current.parentElement;
    }

    return best;
  }

  function elementText(element) {
    return cleanText(element?.innerText ?? element?.textContent ?? "");
  }

  function fallbackPageData(root, pageUrl) {
    const jobRoot = firstElement(root, JOB_ROOT_SELECTORS) ?? root?.body;
    const heading = firstElement(jobRoot, ["h1"]) ?? firstElement(root, ["h1"]);
    const descriptionElement =
      firstElement(jobRoot, DESCRIPTION_SELECTORS) ??
      firstElement(root, DESCRIPTION_SELECTORS) ??
      descriptionFromHeading(jobRoot) ??
      descriptionFromHeading(root);
    const locationElement =
      firstElement(jobRoot, LOCATION_SELECTORS) ??
      firstElement(root, LOCATION_SELECTORS);
    const jobRootText = elementText(jobRoot);
    const descriptionText = elementText(descriptionElement);
    const hasVisibleDescription =
      /\b(?:about the job|job description|about the role)\b/i.test(jobRootText) &&
      jobRootText.length >= 200;

    return {
      title: elementText(heading) || cleanText(root?.title),
      location: elementText(locationElement),
      text: [jobRootText, descriptionText]
        .filter(Boolean)
        .filter((value, index, items) => items.indexOf(value) === index)
        .join(" "),
      url: cleanText(pageUrl),
      descriptionFound: Boolean(descriptionText) || hasVisibleDescription,
    };
  }

  function extractJobPageData(root, pageUrl = "") {
    const fallback = fallbackPageData(root, pageUrl);
    const posting = readStructuredJobPosting(root);

    if (!posting) {
      return fallback;
    }

    const postingText = structuredText(posting);

    return {
      title: cleanText(posting.title) || fallback.title,
      location: combineLocations(
        structuredLocation(posting),
        fallback.location,
      ),
      text: postingText || fallback.text,
      url: cleanText(posting.url) || fallback.url,
      descriptionFound: Boolean(postingText) || fallback.descriptionFound,
    };
  }

  globalScope.ApplyMaybeSkipJobPageData = Object.freeze({
    extractJobPageData,
    findJobPosting,
    structuredLocation,
  });
})(globalThis);
