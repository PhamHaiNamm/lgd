import React, { useState } from 'react';
import { Solar } from 'lunar-javascript';
import './LunarCalendar.css';

const ZHI_VN = {
    '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão',
    '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi',
    '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi'
};

const ZHI_HOURS = {
    'Tý': '23-1', 'Sửu': '1-3', 'Dần': '3-5', 'Mão': '5-7',
    'Thìn': '7-9', 'Tỵ': '9-11', 'Ngọ': '11-13', 'Mùi': '13-15',
    'Thân': '15-17', 'Dậu': '17-19', 'Tuất': '19-21', 'Hợi': '21-23'
};

const getHoangDaoHours = (dayZhi) => {
    const vnZhi = ZHI_VN[dayZhi] || dayZhi;
    const groups = {
        'Tý': ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
        'Ngọ': ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
        'Sửu': ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
        'Mùi': ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
        'Dần': ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
        'Thân': ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
        'Mão': ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
        'Dậu': ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
        'Thìn': ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
        'Tuất': ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
        'Tỵ': ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
        'Hợi': ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi']
    };
    const list = groups[vnZhi] || [];
    return list.map(z => `${z} (${ZHI_HOURS[z]})`).join(', ');
};

export default function LunarCalendar({ items = [], selectedDate, onDateSelect }) {
    const [currentDate, setCurrentDate] = useState(() => {
        return selectedDate ? new Date(selectedDate) : new Date();
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12
    const phatLich = year + 544; // Approx logic for Buddhist Calendar

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0(Sun) - 6(Sat)

    // Generate grid cells
    // We need exactly 6 rows (42 cells) to keep height consistent usually
    const cells = [];

    // Empty cells before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push({ type: 'empty', key: `empty-start-${i}` });
    }

    // Days in current month
    for (let idx = 1; idx <= daysInMonth; idx++) {
        const d = new Date(year, month - 1, idx);
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(idx).padStart(2, '0')}`;

        // Lunar data
        const lunar = Solar.fromYmd(year, month, idx).getLunar();
        const lDay = lunar.getDay();
        const lMonth = lunar.getMonth();
        const dayZhi = lunar.getDayZhi();

        // Check events
        const hasEvents = items.some(e => e.date === dateString);
        const isSelected = selectedDate === dateString;

        cells.push({
            type: 'day',
            key: `day-${idx}`,
            solarDay: idx,
            lunarText: lDay === 1 ? `${lDay}/${lMonth}` : String(lDay),
            dateString,
            isSunday: d.getDay() === 0,
            isSaturday: d.getDay() === 6,
            hasEvents,
            isSelected,
            dayZhi
        });
    }

    // Pad the rest of the 42 cells grid
    const totalCells = cells.length;
    for (let i = 0; i < 42 - totalCells; i++) {
        cells.push({ type: 'empty', key: `empty-end-${i}` });
    }

    // Auspicious hours for selected day or today
    let hdString = '';
    if (selectedDate) {
        const s = new Date(selectedDate);
        const lSel = Solar.fromYmd(s.getFullYear(), s.getMonth() + 1, s.getDate()).getLunar();
        hdString = getHoangDaoHours(lSel.getDayZhi());
    } else {
        const today = new Date();
        const lToday = Solar.fromYmd(today.getFullYear(), today.getMonth() + 1, today.getDate()).getLunar();
        hdString = getHoangDaoHours(lToday.getDayZhi());
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month, 1));
    };

    const handleCellClick = (cell) => {
        if (cell.type === 'day' && onDateSelect) {
            onDateSelect(cell.dateString);
        }
    };

    return (
        <div className="lunar-calendar">
            <div className="lunar-calendar-topbar">
                <span>Giờ hoàng đạo: {hdString}</span>
                <span className="fw-bold">PL: {phatLich}</span>
            </div>

            <div className="lunar-calendar-header">
                <div>
                    <button onClick={prevMonth} className="lunar-nav-btn">«</button>
                    <button onClick={prevMonth} className="lunar-nav-btn">‹</button>
                </div>
                <div>
                    {month}/{year}
                </div>
                <div>
                    <button onClick={nextMonth} className="lunar-nav-btn">›</button>
                    <button onClick={nextMonth} className="lunar-nav-btn">»</button>
                </div>
            </div>

            <div className="lunar-calendar-grid">
                <div className="lunar-weekday">C. NHẬT</div>
                <div className="lunar-weekday">THỨ 2</div>
                <div className="lunar-weekday">THỨ T3</div>
                <div className="lunar-weekday">THỨ 4</div>
                <div className="lunar-weekday">THỨ 5</div>
                <div className="lunar-weekday">THỨ 6</div>
                <div className="lunar-weekday">THỨ 7</div>

                {cells.map((cell) => {
                    if (cell.type === 'empty') {
                        return <div key={cell.key} className="lunar-cell empty"></div>;
                    }

                    let solarClasses = "solar-date";
                    if (cell.isSunday) solarClasses += " sunday";
                    if (cell.isSaturday) solarClasses += " saturday";

                    let cellClasses = "lunar-cell";
                    if (cell.hasEvents) cellClasses += " has-events";
                    if (cell.isSelected) cellClasses += " selected";

                    return (
                        <div
                            key={cell.key}
                            className={cellClasses}
                            onClick={() => handleCellClick(cell)}
                        >
                            <div className={solarClasses}>{cell.solarDay}</div>
                            <div className="lunar-date">{cell.lunarText}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
