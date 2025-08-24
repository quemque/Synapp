// pages/TagsPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import "../components/EditableTaskField.css";

const TagsPage = ({ tasks }) => {
  const { tagName } = useParams();

  if (tagName) {
    const filteredTasks = tasks.filter(
      (task) => task.tags && task.tags.includes(tagName)
    );
    console.log(filteredTasks);
    //return (
    //  <div>
    //    <h2>Задачи с тегом: {tagName}</h2>
    //  </div>
    //);
  }
};
export default TagsPage;
