import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { infoToast } from "../store/slices/Toast/toastSlice";
import { useAppDispatch } from "../hooks/redux";
import { setuserLocation } from "../store/slices/userLocationSlice";

export const webLocation = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const requestLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(
            setuserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }),
          );
        },
        () => {
          dispatch(infoToast(t("settings.errorGeolocation")));
        },
      );
    } else {
      console.error("Геолокация не поддерживается");
    }
  }, [dispatch, t]);

  return requestLocation;
};
