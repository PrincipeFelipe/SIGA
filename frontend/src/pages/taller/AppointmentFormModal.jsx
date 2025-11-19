import React, { useState, useEffect } from 'react';
import { crearCita } from '../../services/citasService';
import { obtenerVehiculos } from '../../services/vehiculosService';
import { obtenerTiposCitaActivos } from '../../services/tiposCitaService';
import { obtenerDisponibilidad } from '../../services/citasService';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { FiSave, FiX, FiClock } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const AppointmentFormModal = ({ onClose }) => {
    const [step, setStep] = useState(1); // 1: Datos básicos, 2: Seleccionar horario
    const [formData, setFormData] = useState({
        vehiculo_id: '',
        tipo_cita_id: '',
        fecha: '',
        hora: '',
        motivo: '',
        notas: ''
    });

    const [vehicles, setVehicles] = useState([]);
    const [appointmentTypes, setAppointmentTypes] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadVehicles();
        loadAppointmentTypes();
    }, []);

    const loadVehicles = async () => {
        try {
            const response = await obtenerVehiculos({ estado: 'activo', limit: 1000 });
            setVehicles(response.data);
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
        }
    };

    const loadAppointmentTypes = async () => {
        try {
            const response = await obtenerTiposCitaActivos();
            setAppointmentTypes(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de cita:', error);
        }
    };

    const loadAvailableSlots = async () => {
        if (!formData.fecha || !formData.tipo_cita_id) return;

        try {
            setLoadingSlots(true);
            const response = await obtenerDisponibilidad(formData.fecha, formData.tipo_cita_id);
            setSlots(response.data.slots);
        } catch (error) {
            console.error('Error al cargar disponibilidad:', error);
            toast.error('Error al cargar horarios disponibles');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Si cambia fecha o tipo, recargar slots
        if ((name === 'fecha' || name === 'tipo_cita_id') && step === 2) {
            loadAvailableSlots();
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        
        if (!formData.vehiculo_id) newErrors.vehiculo_id = 'El vehículo es obligatorio';
        if (!formData.tipo_cita_id) newErrors.tipo_cita_id = 'El tipo de servicio es obligatorio';
        if (!formData.fecha) newErrors.fecha = 'La fecha es obligatoria';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
            loadAvailableSlots();
        }
    };

    const handleSelectSlot = (slot) => {
        if (!slot.disponible) return;
        setFormData(prev => ({ ...prev, hora: slot.inicio }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.hora) {
            Swal.fire({
                icon: 'warning',
                title: 'Horario requerido',
                text: 'Por favor selecciona un horario disponible',
                confirmButtonColor: '#004E2E'
            });
            return;
        }

        try {
            setLoading(true);
            await crearCita({
                vehiculo_id: parseInt(formData.vehiculo_id),
                tipo_cita_id: parseInt(formData.tipo_cita_id),
                fecha_hora_inicio: formData.hora,
                motivo: formData.motivo || null,
                notas: formData.notas || null
            });
            toast.success('Cita creada correctamente');
            onClose(true);
        } catch (error) {
            const message = error.response?.data?.message || 'Error al crear cita';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehiculo_id));
    const selectedType = appointmentTypes.find(t => t.id === parseInt(formData.tipo_cita_id));

    return (
        <Modal
            isOpen={true}
            onClose={() => onClose(false)}
            title={step === 1 ? 'Nueva Cita - Datos Básicos' : 'Nueva Cita - Seleccionar Horario'}
            size="lg"
        >
            {step === 1 ? (
                // PASO 1: Datos básicos
                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                    {/* Vehículo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehículo *
                        </label>
                        <select
                            name="vehiculo_id"
                            value={formData.vehiculo_id}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Seleccionar vehículo</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.matricula} - {vehicle.marca} {vehicle.modelo}
                                </option>
                            ))}
                        </select>
                        {errors.vehiculo_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.vehiculo_id}</p>
                        )}
                    </div>

                    {/* Tipo de Servicio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Servicio *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {appointmentTypes.map(type => (
                                <label
                                    key={type.id}
                                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        formData.tipo_cita_id === String(type.id)
                                            ? 'border-primary bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipo_cita_id"
                                        value={type.id}
                                        checked={formData.tipo_cita_id === String(type.id)}
                                        onChange={handleChange}
                                        className="mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded"
                                                style={{ backgroundColor: type.color }}
                                            />
                                            <span className="font-medium">{type.nombre}</span>
                                        </div>
                                        {type.descripcion && (
                                            <p className="text-sm text-gray-600 ml-5 mt-1">
                                                {type.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <FiClock />
                                        <span>{type.duracion_minutos} min</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.tipo_cita_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.tipo_cita_id}</p>
                        )}
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha *
                        </label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="input-field"
                        />
                        {errors.fecha && (
                            <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
                        )}
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo
                        </label>
                        <input
                            type="text"
                            name="motivo"
                            value={formData.motivo}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Breve descripción del motivo..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onClose(false)}
                        >
                            <FiX className="mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Siguiente: Seleccionar Horario →
                        </Button>
                    </div>
                </form>
            ) : (
                // PASO 2: Seleccionar horario
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Resumen */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Resumen de la cita</h3>
                        <div className="space-y-1 text-sm text-blue-800">
                            <p><strong>Vehículo:</strong> {selectedVehicle?.matricula} - {selectedVehicle?.marca} {selectedVehicle?.modelo}</p>
                            <p><strong>Servicio:</strong> {selectedType?.nombre} ({selectedType?.duracion_minutos} min)</p>
                            <p><strong>Fecha:</strong> {new Date(formData.fecha).toLocaleDateString('es-ES')}</p>
                        </div>
                    </div>

                    {/* Selector de horarios */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Horarios Disponibles
                        </label>
                        
                        {loadingSlots ? (
                            <Loading />
                        ) : (
                            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2">
                                {slots.map((slot, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelectSlot(slot)}
                                        disabled={!slot.disponible}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                            formData.hora === slot.inicio
                                                ? 'border-primary bg-primary text-white'
                                                : slot.disponible
                                                ? 'border-gray-300 hover:border-primary hover:bg-blue-50 text-gray-700'
                                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {slot.hora}
                                    </button>
                                ))}
                            </div>
                        )}

                        {slots.length > 0 && (
                            <div className="mt-3 text-sm text-gray-600">
                                <p>✅ Disponibles: {slots.filter(s => s.disponible).length}</p>
                                <p>❌ Ocupados: {slots.filter(s => !s.disponible).length}</p>
                            </div>
                        )}
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas adicionales
                        </label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            className="input-field"
                            rows="3"
                            placeholder="Observaciones adicionales..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-between pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setStep(1)}
                        >
                            ← Volver
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onClose(false)}
                            >
                                <FiX className="mr-2" />
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={!formData.hora}
                            >
                                <FiSave className="mr-2" />
                                Confirmar Cita
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default AppointmentFormModal;
