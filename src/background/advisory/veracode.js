// https://snyk.io/advisor/npm-package/react
import cache from '../cache';

const scrapeScoreFromVeracode = (registry, packageName) =>
  cache(['veracode', registry, packageName], async () => {
    const resultsJson = await fetch(
      `https://api.sourceclear.com/catalog/search?q=%22${encodeURIComponent(packageName)}%22%20source%3A${encodeURIComponent(
        registry
      )}%20type%3Alibrary`,
      {
        method: 'GET',
        redirect: 'follow',
      }
    ).then((r) => r.json());

    const topResult = resultsJson?.contents[0];

    console.log(topResult);
    const lidId = `lid-${topResult.model.id}`;

    const scPackageName = topResult.model.name;
    let scLanguage = topResult.model.languageType;
    if (scLanguage === 'JS') {
      scLanguage = 'javascript';
    }

    const packageUrl = `https://www.sourceclear.com/vulnerability-database/libraries/${scPackageName}/${scLanguage}/${registry}/${lidId}/summary`;
    const issues = topResult?._vulnCount;
    const fullLatestVersion = topResult?.model?.versions[0];
    const latestReleaseVersion = fullLatestVersion?.version;
    const license = fullLatestVersion?.licenseInfoModels?.map((v) => v.name ?? (v.license.startsWith('BSD') ? 'BSD' : v.license)).join(',');
    const description = `Latest Version: ${latestReleaseVersion}, License: ${license}`;

    return {
      issues,
      summary: description,
      reportUrl: packageUrl,
      data: {},
    };
  });

export default async ({ type, name }) => {
  return scrapeScoreFromVeracode(type, name);
};
