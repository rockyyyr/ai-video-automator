import { useState } from 'react';

export default function Sidebar({ tabs }) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <>
            <div className='sidebar' style={{ width: 60, position: 'absolute', top: 20, bottom: 0, left: 0 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 1031,
                    width: 60,
                    borderTop: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    borderBottom: '1px solid #ccc',
                    borderTopRightRadius: 15,
                    borderBottomRightRadius: 15,
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                }}>
                    {tabs.map((tab, index) => (
                        <div
                            key={index}
                            className={`sidebar-item ${activeTab === index ? 'active' : ''}`}
                            style={{
                                borderBottom: index === tabs.length - 1 ? 'none' : '1px solid #ccc',
                                borderTopRightRadius: index === 0 ? 15 : 0,
                                borderBottomRightRadius: index === tabs.length - 1 ? 15 : 0
                            }}
                            onClick={() => setActiveTab(index)}
                        >
                            <p>{tab.label}</p>
                        </div>
                    ))}
                </div>
            </div >
            <section className='container' style={{ height: 1000 }}>
                {tabs[activeTab].component}
            </section>
        </>
    );
}