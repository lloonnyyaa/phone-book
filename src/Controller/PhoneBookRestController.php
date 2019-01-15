<?php

namespace App\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\Routing\Annotation\Route;
use FOS\RestBundle\Controller\FOSRestController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use App\Repository\{
    ContactRepository,
    PhoneNumberRepository
};
use App\Entity\Contact;

/**
 * @Route("api")
 */
class PhoneBookRestController extends FOSRestController {

    /**
     * Get all contacts
     * 
     * @param ContactRepository $contactRepo
     * @return Response
     * 
     * @Rest\Get("/users")
     */
    public function getAllContacts(ContactRepository $contactRepo): Response {
        $cotacts = $contactRepo->findAll();

        $view = $this->view($cotacts);

        return $this->handleView($view);
    }

    /**
     * Get single contact by name
     * 
     * @param Contact $contact
     * @return Response
     * 
     * @Rest\Get("/users/{name}")
     */
    public function getSingleContact(Contact $contact): Response {
        $view = $this->view($contact);

        return $this->handleView($view);
    }

    /**
     * Insert contact
     * 
     * @param Contact $contact
     * @param ConstraintViolationListInterface $validationErrors
     * @return Response
     * 
     * @Rest\Post("/users")
     * @ParamConverter("contact", converter="fos_rest.request_body")
     */
    public function postSingleContact(Contact $contact, ConstraintViolationListInterface $validationErrors): Response {
        if (count($validationErrors) > 0) {
            foreach ($validationErrors as $error)
                $errorMessages[] = $error->getMessage();

            return $this->_buildResponse(Response::HTTP_NOT_ACCEPTABLE, implode(', ', $errorMessages));
        }

        try {
            $em = $this->getDoctrine()->getManager();
            $em->merge($contact);
            $em->flush();
        } catch (UniqueConstraintViolationException $e) {
            return $this->_buildResponse(Response::HTTP_NOT_ACCEPTABLE, "Duplicate phone number");
        }

        return $this->_buildResponse(Response::HTTP_CREATED, "User added successfully");
    }

    /**
     * Update contact
     * 
     * @param Contact $contact
     * @param Contact $updatedContact
     * @param PhoneNumberRepository $numberRepo
     * @return Response
     * 
     * @Rest\Put("/users/{id}")
     * @ParamConverter("updatedContact", converter="fos_rest.request_body")
     */
    public function putContactAction(Contact $contact, Contact $updatedContact, PhoneNumberRepository $numberRepo): Response {
        $contact->setName($updatedContact->getName() ?? $contact->getName());

        $em = $this->getDoctrine()->getManager();

        $updatedContact->getPhones()->map(function($phone) use($contact, $em) {
            if (!is_null($phone->getId())) {
                $phone->setContact($contact);
                $em->merge($phone);
            } else {
                $contact->addPhone($phone);
            }
        });

        $existPhoneIds = $contact->getPhones()->map(function($p) {
                    return $p->getId();
                })->getValues();

        $newPhoneIds = $updatedContact->getPhones()->map(function($p) {
                    return $p->getId();
                })->getValues();

        $removedNumbers = array_diff(array_filter($existPhoneIds), array_filter($newPhoneIds));

        foreach ($removedNumbers as $rNumber) {
            $removedNumber = $numberRepo->find($rNumber);
            $contact->removePhone($removedNumber);
        }

        $em->persist($contact);
        $em->flush();

        return $this->_buildResponse(Response::HTTP_CREATED, "User updated successfully");
    }

    /**
     * Delete contact
     * 
     * @param Contact $contact
     * @return Response
     * 
     * @Rest\Delete("/users/{id}")
     */
    public function deleteContactAction(Contact $contact): Response {
        try {
            $em = $this->getDoctrine()->getManager();
            $em->remove($contact);
            $em->flush();
        } catch (\Exception $e) {
            return $this->_buildResponse(Response::HTTP_NOT_ACCEPTABLE, $e->getMessage());
        }

        return $this->_buildResponse(Response::HTTP_OK, "User deleted successfully");
    }

    private function _buildResponse($code, $message) {
        $response = [
            "code" => $code,
            "message" => $message
        ];

        $view = $this->view($response, $code);

        return $this->handleView($view);
    }

}
