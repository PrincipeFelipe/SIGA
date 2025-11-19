import React, { useState, useEffect } from 'react';
import { crearTipoCita, actualizarTipoCita } from '../../services/tiposCitaService';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const COLORES_PREDEFINIDOS = [
    { color: '#3B82F6', nombre: 'Azul' },
    { color: '#10B981', nombre: 'Verde' },
    { color: '#F59E0B', nombre: 'Amarillo' },
    { color: '#EF4444', nombre: 'Rojo' },
    { color: '#8B5CF6', nombre: 'Púrpura' },
    { color: '#EC4899', nombre: 'Rosa' },
    { color: '#14B8A6', nombre: 'Turquesa' },
    { color: '#F97316', nombre: 'Naranja' }
];

const AppointmentTypeFormModal = ({ appointmentType, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        duracion_minutos: 60,
        color: '#3B82F6',
        orden: '',
        activo: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (appointmentType) {
            setFormData({
                nombre: appointmentType.nombre || '',
                descripcion: appointmentType.descripcion || '',
                duracion_minutos: appointmentType.duracion_minutos || 60,
                color: appointmentType.color || '#3B82F6',
                orden: appointmentType.orden || '',
                activo: appointmentType.activo !== undefined ? appointmentType.activo : true
            });
        }
    }, [appointmentType]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio';
        if (!formData.duracion_minutos) newErrors.duracion_minutos = 'La duración es obligatoria';
        if (formData.duracion_minutos < 15) newErrors.duracion_minutos = 'La duración mínima es 15 minutos';
        if (formData.duracion_minutos > 480) newErrors.duracion_minutos = 'La duración máxima es 480 minutos (8 horas)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        try {
            setLoading(true);
            const dataToSend = {
                ...formData,
                duracion_minutos: parseInt(formData.duracion_minutos),
                orden: formData.orden ? parseInt(formData.orden) : null,
                activo: formData.activo ? 1 : 0
            };

            if (appointmentType) {
                await actualizarTipoCita(appointmentType.id, dataToSend);
                toast.success('Tipo de cita actualizado correctamente');
            } else {
                await crearTipoCita(dataToSend);
                toast.success('Tipo de cita creado correctamente');
            }
            onClose(true);
        } catch (error) {
            const message = error.response?.data?.message || 'Error al guardar tipo de cita';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => onClose(false)}
            title={appointmentType ? 'Editar Tipo de Cita' : 'Nuevo Tipo de Cita'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <Input
                    label="Nombre del Servicio *"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={errors.nombre}
                    placeholder="ej: Revisión General"
                />

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                        placeholder="Descripción del servicio..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Duración */}
                    <Input
                        label="Duración (minutos) *"
                        name="duracion_minutos"
                        type="number"
                        value={formData.duracion_minutos}
                        onChange={handleChange}
                        error={errors.duracion_minutos}
                        min="15"
                        max="480"
                        step="15"
                    />

                    {/* Orden */}
                    <Input
                        label="Orden de visualización"
                        name="orden"
                        type="number"
                        value={formData.orden}
                        onChange={handleChange}
                        placeholder="Automático"
                        min="1"
                    />
                </div>

                {/* Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color identificativo
                    </label>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                        {COLORES_PREDEFINIDOS.map((colorOption) => (
                            <button
                                key={colorOption.color}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, color: colorOption.color }))}
                                className={`h-12 rounded-lg border-2 transition-all ${
                                    formData.color === colorOption.color
                                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: colorOption.color }}
                                title={colorOption.nombre}
                            />
                        ))}
                    </div>
                    
                    {/* Selector de color personalizado */}
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">
                            Color personalizado: {formData.color}
                        </span>
                    </div>
                </div>

                {/* Estado Activo */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="activo"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                        Tipo de cita activo (disponible para solicitudes)
                    </label>
                </div>

                {/* Vista previa */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: formData.color }}
                        />
                        <span className="font-medium">{formData.nombre || 'Nombre del servicio'}</span>
                        <span className="text-sm text-gray-600">
                            • {formData.duracion_minutos} min
                        </span>
                    </div>
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
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                    >
                        <FiSave className="mr-2" />
                        {appointmentType ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentTypeFormModal;
