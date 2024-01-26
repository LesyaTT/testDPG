document.addEventListener('DOMContentLoaded', function () {
    const contributionGraph = document.getElementById('contributionGraph');

    const popup = createPopup(); // Создаем всплывающее окно

    // Функция форматирования даты в необходимый вид
    function formatDate(date) {
        const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

        const day = date.getDate();
        const dayOfWeek = daysOfWeek[date.getDay()];
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayOfWeek}, ${month} ${day}, ${year}`;
    }

    contributionGraph.addEventListener('click', function (event) {
        const clickedCell = event.target;

        if (clickedCell.classList.contains('contribution-cell')) {
            const isSelected = clickedCell.classList.contains('selected');

            // Скрытие всплывающего окна при повторном клике
            if (isSelected) {
                clickedCell.classList.remove('selected');
                popup.style.display = 'none';
            } else {
                // Получение даты и количество контрибуций
                const dateString = clickedCell.classList[2];
                const fullDate = new Date(dateString);
                const formattedDate = formatDate(fullDate);
                const contributions = clickedCell.classList[3];
                contributions <= 0 ? updatePopupContent(formattedDate, 'No contributions') : updatePopupContent(formattedDate, contributions + ' contributions');
                positionPopup(clickedCell);

                clickedCell.classList.add('selected');
                popup.style.display = 'block';
            }

            // Очистка класса .selected у всех, кроме нажатой ячейки
            const allCells = document.querySelectorAll('.contribution-cell');
            allCells.forEach(cell => {
                if (cell !== clickedCell) {
                    cell.classList.remove('selected');
                }
            });
        }
    });

    // Функция создания всплывающего окна
    function createPopup() {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        document.body.appendChild(popup);
        return popup;
    }

    // Функция для обновления содержимого всплывающего окна
    function updatePopupContent(dateString, contributions) {
        popup.innerHTML = `
        <div class='popup-content'>
            <p class='popup-contributions'>${contributions}</p>
            <p class='popup-date'>${dateString}</p>
        </div>
        <div class='popup-arrow'></div>
        `;
    }

    // Функция для позиционирования всплывающего окна над ячейкой
    function positionPopup(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const popupHeight = popup.clientHeight;
        const popupWidth = popup.clientWidth;
        popup.style.left = (rect.left - popupWidth / 2) + 'px';
        popup.style.top = rect.top - popupHeight - 5 + 'px';
    }

    // Запрос json данных
    fetch('https://dpg.gg/test/calendar.json')
        .then(response => response.json())
        .then(data => {
            renderContributionGraph(data);
            console.log(data)
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Функция рендеринга таблицы ячеек
    function renderContributionGraph(data) {
        const today = new Date();
        const startDate = new Date(today);
        // Вычет сегодняшнего дня с учетом дня недели
        startDate.setDate(today.getDate() - (today.getDay() + 6) % 7 - 50 * 7);

        let currentMonth = -1;

        // Заполнение ячеек
        for (let i = 0; i < 51; i++) {
            for (let j = 0; j < 7; j++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i * 7 + j);

                const dateString = currentDate.toISOString().split('T')[0];
                const contributions = data[dateString] || 0;

                if (currentDate.getMonth() !== currentMonth) {
                    currentMonth = currentDate.getMonth();
                    const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(currentDate);
                    const monthLabelCell = document.createElement('div');
                    const monthsRow = document.getElementById('months');

                    monthLabelCell.textContent = monthName;
                    monthsRow.appendChild(monthLabelCell);
                }

                const cell = document.createElement('div');
                cell.classList.add('contribution-cell', `color-${getContributionsColor(contributions)}`, `${dateString}`, `${contributions}`);
                contributionGraph.appendChild(cell);
            }
        }
    }

    // Функция определения цвета ячейки 
    function getContributionsColor(contributions) {
        if (contributions === 0) {
            return 0;
        } else if (contributions >= 1 && contributions <= 9) {
            return '1-9';
        } else if (contributions >= 10 && contributions <= 19) {
            return '10-19';
        } else if (contributions >= 20 && contributions <= 29) {
            return '20-29';
        } else {
            return '30';
        }
    }
});
