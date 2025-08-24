// pages/TagsPage.jsx
import React from "react";
import { useParams } from "react-router-dom";

const TagsPage = ({ tasks }) => {
  const { tagName } = useParams();

  // Логика для работы с тегами
  const allTags = [...new Set(tasks.flatMap((task) => task.tags || []))];

  if (tagName) {
    // Показываем задачи с определенным тегом
    const filteredTasks = tasks.filter(
      (task) => task.tags && task.tags.includes(tagName)
    );
    console.log(filteredTasks);
    return (
      <div>
        <h2>Задачи с тегом: {tagName}</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>Управление тегами</h2>
      <div>
        <h3>Все теги:</h3>
        <ul>
          {allTags.map((tag) => (
            <li key={tag}>
              <a href={`/tags/${tag}`}>{tag}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TagsPage;
