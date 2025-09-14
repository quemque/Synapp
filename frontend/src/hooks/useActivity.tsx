import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Activity } from "../types";

export function useActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { user, userActivities, saveUserActivities, isAuthenticated } =
    useAuth();

  const loadLocalActivities = useCallback((): Activity[] => {
    if (!isAuthenticated) {
      const savedActivities = localStorage.getItem("scheduleActivities");
      if (savedActivities) {
        try {
          const parsedActivities: Activity[] = JSON.parse(savedActivities);
          return parsedActivities.map((activity) => ({
            ...activity,
            dueDate: new Date(activity.dueDate),
          }));
        } catch (error) {
          console.error("Error parsing activities from localStorage:", error);
          return [];
        }
      }
    }
    return [];
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setActivities(userActivities || []);
    } else {
      const localActivities = loadLocalActivities();
      setActivities(localActivities);
    }
  }, [isAuthenticated, userActivities, loadLocalActivities]);

  const saveActivities = useCallback(
    async (updatedActivities: Activity[]) => {
      try {
        if (isAuthenticated && user) {
          const success = await saveUserActivities(user.id, updatedActivities);
          if (success) {
            setActivities(updatedActivities);
          } else {
            console.error("Failed to save activities to server");
            localStorage.setItem(
              "scheduleActivities",
              JSON.stringify(updatedActivities)
            );
            setActivities(updatedActivities);
          }
        } else {
          localStorage.setItem(
            "scheduleActivities",
            JSON.stringify(updatedActivities)
          );
          setActivities(updatedActivities);
        }
      } catch (error) {
        console.error("Error saving activities:", error);
      }
    },
    [isAuthenticated, user, saveUserActivities]
  );

  const addActivity = async (
    title: string,
    day: string,
    time: string,
    dueDate: Date
  ) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      title: title.trim(),
      day,
      time,
      dueDate,
    };

    const updatedActivities = [...activities, newActivity];
    await saveActivities(updatedActivities);
    return newActivity;
  };

  const deleteActivity = async (id: string) => {
    const updatedActivities = activities.filter(
      (activity) => activity.id !== id
    );
    await saveActivities(updatedActivities);
  };

  const getActivitiesForDay = (day: string) => {
    return activities.filter((activity) => activity.day === day);
  };

  const hasActivities = activities.length > 0;

  return {
    activities,
    addActivity,
    deleteActivity,
    getActivitiesForDay,
    hasActivities,
  };
}
