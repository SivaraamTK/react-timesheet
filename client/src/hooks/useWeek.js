import { useState, useEffect } from "react";

function useWeek(initialWeekStart) {
  // State variable for the week's dates
  const [week, setWeek] = useState({
    mon: new Date(initialWeekStart.setDate(initialWeekStart.getDate())),
    tue: new Date(initialWeekStart.setDate(initialWeekStart.getDate() + 1)),
    wed: new Date(initialWeekStart.setDate(initialWeekStart.getDate() + 2)),
    thu: new Date(initialWeekStart.setDate(initialWeekStart.getDate() + 3)),
    fri: new Date(initialWeekStart.setDate(initialWeekStart.getDate() + 4)),
    sat: new Date(initialWeekStart.setDate(initialWeekStart.getDate() + 5)),
    sun: new Date(initialWeekStart.setDate(initialWeekStart.getDate() + 6)),
  });

  // State variable for the week's start date
  const [weekStart, setWeekStart] = useState(initialWeekStart);

  // Update the week's dates whenever the week's start date changes
  useEffect(() => {
    const weekDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const newWeek = weekDays.reduce((acc, day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      acc[day] = new Date(date);
      return acc;
    }, {});
    setWeek(newWeek);
  }, [weekStart]);

  // Move to the previous week
  const prevWeek = () => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() - 7);
    setWeekStart(date);
  };

  // Move to the next week
  const nextWeek = () => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + 7);
    setWeekStart(date);
  };

  return { week, setWeek, prevWeek, nextWeek };
}

export default useWeek;
