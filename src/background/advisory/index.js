import { getNormalizedPackageID } from '../registries';
import fetchDebricked from './debricked';
import fetchDepsDev from './deps-dev';
import fetchSnyk from './snyk';
import fetchSocket from './socket';
import fetchVeracode from './veracode';

const handleAsyncError = (func, ...args) =>
  Promise.resolve(func(...args)).catch((err) => {
    console.error(err, func.name, args);
    return null;
  });

export default async (packageID) => {
  const normalizedPackageID = await getNormalizedPackageID(packageID);

  const depsDev = handleAsyncError(fetchDepsDev, normalizedPackageID);
  const info = depsDev.then((depsDevInfo) => {
    const { latestVersion, licenses, stars } = depsDevInfo.data;
    return {
      latest: latestVersion,
      licenses,
      stars,
    };
  });

  return {
    debricked: handleAsyncError(fetchDebricked, normalizedPackageID),
    depsDev,
    info,
    snyk: handleAsyncError(fetchSnyk, normalizedPackageID),
    socket: handleAsyncError(fetchSocket, normalizedPackageID),
    veracode: handleAsyncError(fetchVeracode, normalizedPackageID),
  };
};
