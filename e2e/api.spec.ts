import { test, expect } from '@playwright/test';
import axios from 'axios';



interface BookingResponse {
  bookingid: number;
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  additionalneeds: string;
}
 

test.describe.serial('flujoServiciosWeb @api', () => {
  let bookingId: number;
  let authToken: string;

  // CREAR TOKEN: Crear un nuevo token de autenticación para usar y acceder a PUT y DELETE /booking //

  test('createToken', async () => {
    const username = "admin";
    const password = "password123";

    try {
      const response = await axios.post("https://restful-booker.herokuapp.com/auth", {
        username,
        password
      });
      expect(response.status).toBe(200);
      authToken = response.data.token; 
      console.log("Token de autenticación:", authToken);
    } catch (error) {
      console.error("Error:", error);
    }
  });

  //CREAR RESERVA: Crea una nueva reserva en la API //

  test('createBooking', async ({ page }) => {
    // Datos de la reserva
    const bookingData = {
      firstname: 'Angie Dayanna',
      lastname: 'Rodriguez Mora',
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: '2018-01-01',
        checkout: '2019-01-01'
      },
      additionalneeds: 'Breakfast'
    };

    try {
      const response = await fetch('https://restful-booker.herokuapp.com/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      expect(response.status).toBe(200);
      const bookingResponse: BookingResponse = await response.json(); 
      expect(bookingResponse).toHaveProperty('bookingid');
      bookingId = bookingResponse.bookingid;
      console.log('Datos de la reserva:', bookingResponse);
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // VISUALIZAR RESERVA: Devuelve una reserva específica basada en la identificación de reserva proporcionada //

  test('getBooking', async ({ page }) => {
    try {
      const response = await fetch(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const bookingDetails = await response.json();

      console.log('Detalles de la reserva:', bookingDetails);
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // ACTUALIZAR RESERVAS: Actualiza una reserva actual // 

  test('updateBooking', async ({}) => {
    try {
      // Datos actualizados de la reserva
      const updatedBookingData = {
        firstname: 'Angie',
        lastname: 'Brown',
        totalprice: 111,
        depositpaid: true,
        bookingdates: {
          checkin: '2018-01-01',
          checkout: '2019-01-01'
        },
        additionalneeds: 'Breakfast'
      };

      const response = await fetch(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': `token=${authToken}`
        },
        body: JSON.stringify(updatedBookingData)
      });

        expect(response.status).toBe(200);
        const updatedBookingDetails = await response.json();
        console.log('Detalles de la reserva actualizada:', updatedBookingDetails);
        expect(updatedBookingDetails).toMatchObject(updatedBookingData);
      } catch (error) {
        console.error("Error:", error);
      }
  });

  // ELIMINAR RESERVA: Eliminar la reserva creada en la API //

  test('deleteBooking', async () => {
    try {
      const response = await axios.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${authToken}`
        }
      });
      expect(response.status).toBe(201); 
      console.log('Reserva eliminada exitosamente');
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

/*VISUALIZAR TODAS LAS RESERVAS CREADAS: Devuelve los identificadores de todas las reservas que existen dentro de la API. 
                                        Puede tomar cadenas de consulta opcionales para buscar y devolver un subconjunto de identificadores de reserva*/

test('getBookingIds @api', async ({ page }) => {
  try {
    const response = await fetch(`https://restful-booker.herokuapp.com/booking`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    expect(response.status).toBe(200);
    const bookingDetails = await response.json();

    console.log('Numero ID de las Reservas Realizadas:', bookingDetails);
  } catch (error) {
    console.error("Error:", error);
  }
});

// COMPROBACIÓN DE ESTADO: Un punto final de verificación de estado simple para confirmar si la API está en funcionamiento.

test('healthCheck @api', async () => {
  try {
    const response = await fetch('https://restful-booker.herokuapp.com/ping', {
      headers: {
        'Accept': 'application/json'
      }
    });

    expect(response.status).toBe(201);
    const responseBody = await response.text();
    console.log('El servidor está activo y respondiendo correctamente.');
    console.log('Respuesta del servidor:', responseBody);
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
});
