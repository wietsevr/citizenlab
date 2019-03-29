import React from 'react';
import { removeUrlLocale } from 'services/locale';

// Make url without locale the canonical of a certain page
// e.g. our URL = https://youth4climate.be/nl-BE/
// this function will turn it into the following link element to put in the head element of the page:
// <link rel="canonical" href="https://youth4climate.be/"/>
// this lets Google know it should show 'https://youth4climate.be/' in the search results, not the version with locale
export default function getCanonicalLink() {
  return <link rel="canonical" href={`${location.origin}${removeUrlLocale(location.pathname)}`} />;
}
