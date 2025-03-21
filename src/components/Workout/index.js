import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FadeLoader from 'react-spinners/FadeLoader';
import styles from './styles.module.css';
import { Link, useHistory } from 'react-router-dom';
import { IconContext } from 'react-icons';
import { IoAddCircle, IoCreate, IoCloseCircle } from 'react-icons/io5';
import { render } from 'react-dom';

export default () => {
	const [workouts, setWorkouts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const { currentUser } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const { push } = useHistory();
	const API_ROOT = process.env.REACT_APP_API_ROOT
		? process.env.REACT_APP_API_ROOT
		: 'https://devmuscles.herokuapp.com';

	const fetchWorkouts = async () => {
		try {
			const { data } = await axios.get(`${API_ROOT}/users/${currentUser.id}/workouts`, {
				headers: { Authorization: `Token ${currentUser.token}` },
			});
			setWorkouts(data);
			setIsLoading(false);
		} catch (err) {
			setIsError(true);
		}
	};

	const handleDelete = async (id) => {
		try {
			await axios.delete(`${API_ROOT}/users/${currentUser.id}/workouts/${id}`, {
				headers: { Authorization: `Token ${currentUser.token}` },
			});
			fetchWorkouts();
		} catch (err) {
			setIsError(true);
		}
	};

	const updateWorkout = async () => {
		try {
			await axios.put(
				`${API_ROOT}/users/${currentUser.id}/workouts/${workoutId}`,
				{ name: workoutUpdateName },
				{
					headers: { Authorization: `Token ${currentUser.token}` },
				}
			);
		} catch (err) {
			setIsError(true);
		}
	};

	const openUpdateForm = (workoutId) => {
		setWorkoutId(workoutId);
		setIsUpdateModalOpen(true);
	};

	const handleUpdateSubmit = async (e) => {
		e.preventDefault();
		await updateWorkout();
		setWorkoutId('');
		setUpdateWorkoutName('');
		fetchWorkouts();
		setIsUpdateModalOpen(false);
	};

	useEffect(() => {
		fetchWorkouts();
	}, [currentUser]);

	const renderWorkouts = () => {
		return isError ? (
			<p role="alert">
				Oops! Something went wrong. <br /> Please refresh or try again later.
			</p>
		) : isLoading ? (
			<FadeLoader data-testid="spinner" loading={isLoading} size={50} />
		) : (
			workouts.map((workout, i) => (
				<div className={styles.workouts} key={i}>
					<div
						className={styles.workout_name}
						onClick={() => {
							push(`/workouts/${workout.id}`);
						}}
					>
						{workout['name']}
					</div>
					<div className={styles.workout_icons}>
						<div onClick={() => openUpdateForm(workout.id)}>
							<IconContext.Provider value={{ className: styles.icon_workout }}>
								<IoCreate />
							</IconContext.Provider>
						</div>
						<div onClick={() => handleDelete(workout.id)}>
							<IconContext.Provider value={{ className: styles.icon_workout }}>
								<IoCloseCircle />
							</IconContext.Provider>
						</div>
					</div>
				</div>
			))
		);
	};

	const handleClick = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const [workoutName, setWorkoutName] = useState('');
	const [workoutId, setWorkoutId] = useState('');
	const [workoutUpdateName, setUpdateWorkoutName] = useState('');

	const handleChange = (e) => {
		setWorkoutName(e.target.value);
	};

	const handleUpdateChange = (e) => {
		setUpdateWorkoutName(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await newWorkouts(workoutName);
		fetchWorkouts();
		closeModal();
	};

	const newWorkouts = async (workoutName) => {
		try {
			const { new_data } = await axios.post(
				`${API_ROOT}/users/${currentUser.id}/workouts`,
				{ name: workoutName },
				{
					headers: { Authorization: `Token ${currentUser.token}` },
				}
			);
		} catch (err) {
			setIsError(true);
		}
	};

	return (
		<>
			<div className={styles.workouts_container}>{renderWorkouts()}</div>
			<button onClick={handleClick}>
				<IconContext.Provider value={{ className: styles.icon }}>
					<IoAddCircle />
				</IconContext.Provider>
			</button>
			{isModalOpen ? (
				<div className={styles.workout_modal}>
					<form onSubmit={handleSubmit}>
						<label htmlFor="username">Name your workout:</label>
						<input type="text" required onChange={handleChange} />
						<button onClick={handleSubmit}>Add workout</button>
					</form>
				</div>
			) : null}
			{isUpdateModalOpen ? (
				<form onSubmit={handleUpdateSubmit}>
					<label htmlFor="username">Rename your workout:</label>
					<input type="text" required value={workoutUpdateName} onChange={handleUpdateChange} />
					<button onClick={handleUpdateSubmit}>Confirm</button>
				</form>
			) : null}
		</>
	);
};
