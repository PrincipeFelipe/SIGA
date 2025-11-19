import React, { useState, useEffect } from 'react';
import { crearVehiculo, actualizarVehiculo } from '../../services/vehiculosService';
import unidadesService from '../../services/unidadesService';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const VehicleFormModal = ({ vehicle, isReadOnly, onClose }) => {
    const [formData, setFormData] = useState({
        unidad_id: '',
        matricula: '',
        marca: '',
        modelo: '',
        tipo_vehiculo: 'turismo',
        ano_fabricacion: '',
        kilometraje: '',
        numero_bastidor: '',
        fecha_alta: new Date().toISOString().split('T')[0],
        estado: 'activo',
        notas: ''
    });

    const [units, setUnits] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                unidad_id: vehicle.unidad_id || '',
                matricula: vehicle.matricula || '',
                marca: vehicle.marca || '',
                modelo: vehicle.modelo || '',
                tipo_vehiculo: vehicle.tipo_vehiculo || 'turismo',
                ano_fabricacion: vehicle.ano_fabricacion || '',
                kilometraje: vehicle.kilometraje || '',
                numero_bastidor: vehicle.numero_bastidor || '',
                fecha_alta: vehicle.fecha_alta ? vehicle.fecha_alta.split('T')[0] : '',
                estado: vehicle.estado || 'activo',
                notas: vehicle.notas || ''
            });
        }
        loadUnits();
    }, [vehicle]);

    const loadUnits = async () => {
        try {
            const response = await unidadesService.getTree();
            setUnits(response);
        } catch (error) {
            console.error('Error al cargar unidades:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.unidad_id) newErrors.unidad_id = 'La unidad es obligatoria';
        if (!formData.matricula) newErrors.matricula = 'La matrícula es obligatoria';
        if (!formData.marca) newErrors.marca = 'La marca es obligatoria';
        if (!formData.modelo) newErrors.modelo = 'El modelo es obligatorio';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        try {
            setLoading(true);
            if (vehicle) {
                await actualizarVehiculo(vehicle.id, formData);
                toast.success('Vehículo actualizado correctamente');
            } else {
                await crearVehiculo(formData);
                toast.success('Vehículo creado correctamente');
            }
            onClose(true);
        } catch (error) {
            const message = error.response?.data?.message || 'Error al guardar vehículo';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => onClose(false)}
            title={isReadOnly ? 'Ver Vehículo' : vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        >
            {isReadOnly && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
                    <p className="font-medium">Modo solo lectura</p>
                    <p className="text-sm">No tienes permisos para editar este vehículo</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unidad */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unidad *
                        </label>
                        <select
                            name="unidad_id"
                            value={formData.unidad_id}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="input-field"
                        >
                            <option value="">Seleccionar unidad</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.codigo_unidad} - {unit.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.unidad_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.unidad_id}</p>
                        )}
                    </div>

                    {/* Matrícula */}
                    <Input
                        label="Matrícula *"
                        name="matricula"
                        value={formData.matricula}
                        onChange={handleChange}
                        error={errors.matricula}
                        disabled={isReadOnly}
                        placeholder="1234ABC"
                        className="uppercase"
                    />

                    {/* Tipo de Vehículo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Vehículo
                        </label>
                        <select
                            name="tipo_vehiculo"
                            value={formData.tipo_vehiculo}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="input-field"
                        >
                            <option value="turismo">Turismo</option>
                            <option value="furgon">Furgón</option>
                            <option value="camion">Camión</option>
                            <option value="motocicleta">Motocicleta</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    {/* Marca */}
                    <Input
                        label="Marca *"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        error={errors.marca}
                        disabled={isReadOnly}
                        placeholder="Volkswagen"
                    />

                    {/* Modelo */}
                    <Input
                        label="Modelo *"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        error={errors.modelo}
                        disabled={isReadOnly}
                        placeholder="Golf"
                    />

                    {/* Año de Fabricación */}
                    <Input
                        label="Año de Fabricación"
                        name="ano_fabricacion"
                        type="number"
                        value={formData.ano_fabricacion}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                    />

                    {/* Kilometraje */}
                    <Input
                        label="Kilometraje"
                        name="kilometraje"
                        type="number"
                        value={formData.kilometraje}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        placeholder="50000"
                        min="0"
                    />

                    {/* Número de Bastidor */}
                    <div className="md:col-span-2">
                        <Input
                            label="Número de Bastidor (VIN)"
                            name="numero_bastidor"
                            value={formData.numero_bastidor}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="WVWZZZ1KZBW000000"
                            className="uppercase"
                        />
                    </div>

                    {/* Fecha de Alta */}
                    <Input
                        label="Fecha de Alta"
                        name="fecha_alta"
                        type="date"
                        value={formData.fecha_alta}
                        onChange={handleChange}
                        disabled={isReadOnly}
                    />

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="input-field"
                        >
                            <option value="activo">Activo</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>

                    {/* Notas */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas
                        </label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="input-field"
                            rows="3"
                            placeholder="Observaciones sobre el vehículo..."
                        />
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
                        {isReadOnly ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {!isReadOnly && (
                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                        >
                            <FiSave className="mr-2" />
                            {vehicle ? 'Actualizar' : 'Crear'}
                        </Button>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default VehicleFormModal;
