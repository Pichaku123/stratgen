import React from 'react';
import TacticsBoard from './TacticsBoard';

const Dashboard = () => {
    return (
        <>
            <div className="card glass-panel">
                <h1 className="app-title">StratGen</h1>
                <TacticsBoard />
            </div>
        </>
    );
};

export default Dashboard;
