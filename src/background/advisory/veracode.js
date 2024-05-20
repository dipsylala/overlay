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

    // The first result does not always match the package name exactly,
    // so we need to check the name against the list
    const bestResult = resultsJson.contents.find((result) => result.model.name === packageName);

    console.log(bestResult);
    const lidId = `lid-${bestResult.model.id}`;

    var scPackageName = bestResult.model.name;
    let scLanguage = bestResult.model.languageType;
    if (scLanguage === 'JS') {
      scLanguage = 'javascript';
      // Angular names will include '@' and '/' - for example `@angular/cli`
      scPackageName = scPackageName.replaceAll('@', '').replaceAll('/', '-');
    }

    const packageUrl = `https://sca.analysiscenter.veracode.com/vulnerability-database/libraries/${scPackageName}/${scLanguage}/${registry}/${lidId}/summary`;
    const issues = bestResult?._vulnCount;
    const fullLatestVersion = bestResult?.model?.versions[0];
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
